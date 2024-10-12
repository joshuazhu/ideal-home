import { useEffect, useRef, useState } from 'react';
import polyline from '@mapbox/polyline';
import {
  getPolygonPathsById,
  searchByCoordinates
} from '../../requests/openStreetMap';
import { XCircleIcon, PlusCircleIcon } from '@heroicons/react/16/solid';
import {
  Button,
  Card,
  Collapse,
  Flex,
  Form,
  Input,
  Image,
  Slider
} from 'antd';
import { v4 as uuid } from 'uuid';
import { getGeoCodingByAddress } from '../../requests/geocoding';
import { searchByAddress } from '../../requests/propertyDetails';
import { Property } from '../../models';
import { BedIcon } from '../../icons/BedIcon';
import { ShowerIcon } from '../../icons/ShowerIcon';
import { CarIcon } from '../../icons/CarIcon';
import { toMillionDollars } from '../../utils';
import { useGlobalContext } from '../Context/globalContext';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export const SearchPanelComponent = ({}: {}) => {
  const { setSuburb, setMapCenter, setProperties, suburb, properties } =
    useGlobalContext();

  // init google autocomplete
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  const [selectedProperty, setSelectedProperty] = useState<Property>();

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', async () => {
      const place = placeAutocomplete.getPlace();

      if (place.geometry) {
        const location = place.geometry.location;

        if (!location) return;

        const coordinates = {
          lat: location.lat(),
          lng: location.lng()
        };

        const response = await searchByCoordinates(coordinates);
        const osmId = response.osm_id;
        const responsePolygon = await getPolygonPathsById(osmId);

        if (responsePolygon.geometry) {
          const polygonCoordinates = responsePolygon.geometry.coordinates as [
            number,
            number
          ][][];
          const encodedPolygonCoordinates = polygonCoordinates.map((path) =>
            path.map(([lng, lat]) => [lat, lng])
          ) as [number, number][][];

          setSuburb({
            name: place.name || '',
            address: place.formatted_address || '',
            coordinates,
            polygonPaths: encodedPolygonCoordinates.map((path) =>
              polyline.encode(path)
            )
          });
        }
        setMapCenter(coordinates);
      } else {
        alert('No details available for input: ' + place.name);
      }
    });
  }, [placeAutocomplete, setMapCenter, setSuburb]);

  const PropertiesCollapse = ({ properties }: { properties: Property[] }) => {
    return (
      <Collapse
        items={properties.map((property) => ({
          key: property.address,
          label: property.address,
          children: selectedProperty && selectedProperty.details && (
            <div>
              <div className='mb-4'>
                <Image
                  src={
                    selectedProperty.details.links.find(
                      (x) => x.rel === 'mainImage'
                    )?.href
                  }
                />
              </div>
              <Flex vertical align='start'>
                <div className='text-[28px] mb-1 font-semibold'>
                  {property.detailedAddress.streetNumber}{' '}
                  {property.detailedAddress.streetName}{' '}
                  {property.detailedAddress.streetType}
                </div>
                <div className='text-[16px] mb-3 font-semibold'>
                  {property.detailedAddress.suburb}{' '}
                  {property.detailedAddress.stateCode}{' '}
                  {property.detailedAddress.postCode}
                </div>
              </Flex>
              <Flex gap='middle' justify='flex-start'>
                <Flex>
                  <div className='pr-1'>
                    <BedIcon width={24} />
                  </div>
                  <div className='font-semibold'>
                    {selectedProperty.details.beds}{' '}
                  </div>
                </Flex>

                <Flex className='mb-8'>
                  <div className='pr-1'>
                    <ShowerIcon width={24} />
                  </div>
                  <div className='font-semibold'>
                    {selectedProperty.details.baths}
                  </div>
                </Flex>
                <Flex>
                  <div className='pr-1'>
                    <CarIcon width={24} />
                  </div>
                  <div className='font-semibold'>
                    {selectedProperty.details.carSpaces}
                  </div>
                </Flex>
              </Flex>

              <Flex vertical>
                <Flex className='text-[16px] mb-1 font-semibold'>
                  Estimated Value
                </Flex>
                <Flex align='center' className='pl-4'>
                  <Slider
                    disabled={true}
                    className='w-5/6 font-bold'
                    marks={{
                      0: toMillionDollars(
                        selectedProperty.details.guesstimate.fromPrice
                      ),
                      [Math.floor(
                        ((selectedProperty.details.guesstimate.price -
                          selectedProperty.details.guesstimate.fromPrice) /
                          (selectedProperty.details.guesstimate.toPrice -
                            selectedProperty.details.guesstimate.fromPrice)) *
                          100
                      )]: toMillionDollars(
                        selectedProperty.details.guesstimate.price
                      ),
                      100: toMillionDollars(
                        selectedProperty.details.guesstimate.toPrice
                      )
                    }}
                    included={false}
                    defaultValue={Math.floor(
                      ((selectedProperty.details.guesstimate.price -
                        selectedProperty.details.guesstimate.fromPrice) /
                        (selectedProperty.details.guesstimate.toPrice -
                          selectedProperty.details.guesstimate.fromPrice)) *
                        100
                    )}
                  />
                </Flex>
              </Flex>
            </div>
          )
        }))}
        onChange={async (address) => {
          if (address) {
            const property = properties.find(
              (property) => property.address === address[0]
            );

            if (!property) return;

            const propertyDetails = await searchByAddress(
              property!.detailedAddress
            );

            // setSelectedProperty({
            //   ...property,
            //   details: propertyDetails
            // });

            setSelectedProperty({
              address: '14 Greenwood Ave, Ringwood VIC 3134',
              coordinates: [-37.812, 145.231],
              detailedAddress: {
                streetNumber: '14',
                streetName: 'Greenwood',
                streetType: 'Ave',
                suburb: 'Ringwood',
                unitNumber: '',
                stateCode: 'VIC',
                postCode: '3134'
              },
              details: {
                beds: 4,
                baths: 3,
                carSpaces: 2,
                landSizeUnit: 'squareMeter',
                guesstimate: {
                  price: 1140000,
                  calculationDate: '2024-10-07',
                  errorRate: 0.12,
                  fromPrice: 1100000,
                  toPrice: 1200000,
                  confidence: 'Medium'
                },
                links: [
                  {
                    rel: 'self',
                    href: 'https://api-gateway-alb.cnsr-onthehouse-prod.aws.corelogic.io:443/properties/9631638'
                  },
                  {
                    rel: 'mainImage',
                    href: 'https://das-web.corelogic.asia/v1/asset/AMTHYUDRPAI6XGSZ7EGHZD46PY/resize;m=exact;w=470;h=313'
                  },
                  {
                    rel: 'othWebUrl',
                    href: 'https://www.onthehouse.com.au/property/vic/ringwood-3134/14-greenwood-ave-ringwood-vic-3134-9631638'
                  }
                ]
              }
            });

            console.log('propertyDetails', propertyDetails);
          }
        }}
        defaultActiveKey={selectedProperty?.address}
      />
    );
  };

  const resetAddress = () => {
    // setMapCenter(DEFAULT_POSITION);
    // setSuburb(DEFAULT_SUBURB)
  };

  // const hasSearchResult = polygonPaths.length > 0;
  const hasSearchResult = true;

  return (
    <>
      <div className='overflow-y-auto max-h-[950px]'>
        <Card title='Search Suburb' className='mb-4'>
          <div className='flex items-center justify-center'>
            <div>
              <input
                ref={inputRef}
                type='text'
                placeholder='Enter your address'
                style={{ width: '300px', padding: '10px' }}
              />
            </div>

            {hasSearchResult && (
              <div className='pl-1 pb-3'>
                <Button
                  color='danger'
                  variant='solid'
                  onClick={(e) => {
                    e.preventDefault();
                    resetAddress();
                  }}
                >
                  <XCircleIcon className='h-5' />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};
