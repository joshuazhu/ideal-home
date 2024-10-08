import { useEffect, useRef, useState } from 'react';
import polyline from '@mapbox/polyline';
import {
  getPolygonPathsById,
  searchByCoordinates
} from '../../requests/openStreetMap';
import { XCircleIcon, PlusCircleIcon } from '@heroicons/react/16/solid';
import { DEFAULT_POSITION } from '../../const';
import { Button, Card, Collapse, Divider, Flex, Form, Input } from 'antd';
import { v4 as uuid } from 'uuid';
import { getGeoCodingByAddress } from '../../requests/geocoding';
import { searchByAddress } from '../../requests/propertyDetails';
import { Property } from '../../models';

export const SearchPanelComponent = ({
  setCenter,
  setPolygonPaths,
  polygonPaths,
  searchAddress,
  setSearchAddress,
  setProperties,
  properties
}: {
  setCenter: ({ lat, lng }: { lat: number; lng: number }) => void;
  setPolygonPaths: (paths: string[]) => void;
  polygonPaths: string[];
  searchAddress: string;
  setSearchAddress: (searchAddress: string) => void;
  setProperties: (properties: Property[]) => void;
  properties: Property[];
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [propertyAddresses, setPropertyAddresses] = useState<
    Record<string, { address: string; coordinates: [number, number] }>
  >({});

  const [selectedProperty, setSelectedProperty] = useState<Property>();

  useEffect(() => {
    if (!window.google?.maps?.places) {
      console.error('Google Maps Places library not loaded');
      return;
    }
    if (!inputRef.current) return;

    // Initialize the autocomplete functionality
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['(cities)'], // restrict to cities or you can use 'geocode' for addresses
        componentRestrictions: { country: 'au' } // restrict to a country (optional)
      }
    );

    // Add listener for place selection
    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace();

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
          setPolygonPaths(
            encodedPolygonCoordinates.map((path) => polyline.encode(path))
          );
        }

        setCenter(coordinates);
      } else {
        alert('No details available for input: ' + place.name);
      }
    });
  }, [
    window.google,
    setCenter,
    setPolygonPaths,
    searchByCoordinates,
    getPolygonPathsById
  ]);

  const PropertiesCollapse = ({ properties }: { properties: Property[] }) => {
    return (
      <Collapse
        items={properties.map((property) => ({
          key: property.address,
          label: property.address,
          children: selectedProperty && selectedProperty.details && (
            <div>
              <Flex justify="space-between">
                <div>🛏️: {selectedProperty.details.beds} </div>
                <div>🛁: {selectedProperty.details.baths}</div>
                <div>🚘: {selectedProperty.details.baths}</div>
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

            setSelectedProperty({
              ...property,
              details: propertyDetails
            });

            console.log('propertyDetails', propertyDetails);
          }
        }}
        defaultActiveKey={selectedProperty?.address}
      />
    );
  };

  const resetAddress = () => {
    setCenter(DEFAULT_POSITION);
    setPolygonPaths([]);
    setSearchAddress('');
  };

  const hasSearchResult = polygonPaths.length > 0;

  return (
    <>
      <h3>Search Suburb</h3>
      <div className='flex items-center justify-center'>
        <div>
          <input
            type='text'
            value={searchAddress}
            className='w-full'
            ref={inputRef}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder='Enter suburb name'
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

      {hasSearchResult && (
        <div>
          <Card title='Property Addresses'>
            <div className='pb-6'>
              <Button
                onClick={() => {
                  setPropertyAddresses((prevState) => ({
                    ...prevState,
                    [uuid()]: {
                      address: '',
                      coordinates: [0, 0]
                    }
                  }));
                }}
              >
                <PlusCircleIcon className='h-5' /> Add Property
              </Button>
            </div>
            <Form
              onFinish={async (e) => {
                setPropertyAddresses(
                  Object.keys(e).reduce((acc, key) => {
                    const address = e[key];
                    return {
                      ...acc,
                      [key]: {
                        address,
                        coordinates: [0, 0]
                      }
                    };
                  }, {})
                );

                const requests = Object.keys(e).map(async (key) => {
                  const address = e[key] as string;

                  const coordinates = await getGeoCodingByAddress(address);
                  const addressComponents = coordinates.address_components;
                  console.log('coordinates', coordinates);

                  if (!coordinates) return;

                  return {
                    address,
                    coordinates: [
                      coordinates.geometry.location.lat,
                      coordinates.geometry.location.lng
                    ] as [number, number],
                    detailedAddress: {
                      unitNumber:
                        addressComponents.length < 8
                          ? ''
                          : addressComponents[0].short_name,
                      streetNumber:
                        addressComponents.length < 8
                          ? addressComponents[0].short_name
                          : addressComponents[1].short_name,
                      streetName:
                        addressComponents.length < 8
                          ? addressComponents[1].short_name.split(' ')[0]
                          : addressComponents[2].short_name.split(' ')[0],
                      streetType:
                        addressComponents.length < 8
                          ? addressComponents[1].short_name.split(' ')[1]
                          : addressComponents[2].short_name.split(' ')[1],
                      suburb:
                        addressComponents.length < 8
                          ? addressComponents[2].short_name
                          : addressComponents[3].short_name,
                      postcode:
                        addressComponents.length < 8
                          ? addressComponents[6].short_name
                          : addressComponents[7].short_name
                    }
                  };
                });

                const properties = await Promise.all(requests);

                setProperties(
                  properties.filter(Boolean) as {
                    coordinates: [number, number];
                    address: string;
                    detailedAddress: any;
                  }[]
                );
              }}
            >
              {Object.keys(propertyAddresses).map((key, index) => (
                <div>
                  <Form.Item
                    label={`Property-${index + 1}`}
                    name={key}
                    rules={[
                      { required: true, message: 'Please input your address!' }
                    ]}
                  >
                    <div className='flex items-center justify-center'>
                      <div>
                        <Input />
                      </div>
                    </div>
                  </Form.Item>
                </div>
              ))}

              {Object.keys(propertyAddresses).length > 0 && (
                <Button color='primary' variant='solid' htmlType='submit'>
                  Submit
                </Button>
              )}
            </Form>
          </Card>

          {properties.length > 0 && (
            <>
              <Divider>Property Details</Divider>
              <PropertiesCollapse properties={properties}></PropertiesCollapse>
            </>
          )}
        </div>
      )}
    </>
  );
};
