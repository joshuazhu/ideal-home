import { useEffect, useRef, useState } from 'react';
import polyline from '@mapbox/polyline';
import {
  getPolygonPathsById,
  searchByCoordinates
} from '../../requests/openStreetMap';
import { XCircleIcon, PlusCircleIcon } from '@heroicons/react/16/solid';
import { DEFAULT_POSITION } from '../../const';
import { Button, Card, Divider, Form, Input } from 'antd';
import { v4 as uuid } from 'uuid';
import { getGeoCodingByAddress } from '../../requests/geocoding';

export const SearchPanelComponent = ({
  setCenter,
  setPolygonPaths,
  polygonPaths,
  searchAddress,
  setSearchAddress,
  setProperties
}: {
  setCenter: ({ lat, lng }: { lat: number; lng: number }) => void;
  setPolygonPaths: (paths: string[]) => void;
  polygonPaths: string[];
  searchAddress: string;
  setSearchAddress: (searchAddress: string) => void;
  setProperties: (properties: { coordinates: [number, number]; address: string }[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [propertyAddresses, setPropertyAddresses] = useState<
    Record<string, {address: string, coordinates: [number, number]}>
  >({});

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
          <Divider>Text</Divider>
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

                  if (!coordinates) return;

                  return {
                    address,
                    coordinates: [coordinates.geometry.location.lat, coordinates.geometry.location.lng] as [number, number]
                  }
                })

                const properties = await Promise.all(requests);

                console.log('properties', properties);

                setProperties(properties.filter(Boolean) as { coordinates: [number, number]; address: string }[]);
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
        </div>
      )}
    </>
  );
};
