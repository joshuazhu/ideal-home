import PlusCircleIcon from '@heroicons/react/16/solid/PlusCircleIcon';
import { Button, Card, Form, Input } from 'antd';
import { v4 as uuid } from 'uuid';
import { getGeoCodingByAddress } from '../../requests/geocoding';
import { useEffect, useMemo, useState } from 'react';
import { useGlobalContext } from '../Context/globalContext';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Property } from '../../models';

export const SubmitPropertiesFormComponent = () => {
  const { setSuburb, setMapCenter, setProperties, suburb, properties } =
    useGlobalContext();

  const [propertyAddresses, setPropertyAddresses] = useState<
    Record<string, string>
  >({});

  const [isSubmitProperties, setIsSubmitProperties] = useState(false);

  const geocodingLib = useMapsLibrary('geocoding');
  const geocoder = useMemo(
    () => geocodingLib && new geocodingLib.Geocoder(),
    [geocodingLib]
  );

  const mapGeoCodeResultToProperty = (result: google.maps.GeocoderResult): Property => {
    const addressComponents = result.address_components;

    return {
      address: result.formatted_address,
      coordinates: [
        result.geometry.location.lat(),
        result.geometry.location.lng()
      ] as [number, number],
      detailedAddress: {
        unitNumber:
          addressComponents.length < 8 ? '' : addressComponents[0].short_name,
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
        postCode:
          addressComponents.length < 8
            ? addressComponents[6].short_name
            : addressComponents[7].short_name
      }
    };
  };

  useEffect(() => {
    if (!geocoder || !isSubmitProperties) return;

    const getPropertyAddresses = async () => {
      const requests = Object.keys(propertyAddresses).map(async (id) => {
        const address = propertyAddresses[id];
        const coordinates = await geocoder.geocode({
          address
        });

        if (!coordinates || !coordinates.results[0]) return;
        return mapGeoCodeResultToProperty(coordinates.results[0]);
      });

      const properties = await Promise.all(requests);
      setProperties(properties.filter(Boolean) as Property[]);
    };

    getPropertyAddresses();
    setIsSubmitProperties(false);
  }, [geocoder, propertyAddresses, setProperties, isSubmitProperties]);

  if (!suburb.address) return null;

  return (
    <div>
      <Card title='Property Addresses'>
        <div className='pb-6'>
          <Button
            onClick={() => {
              setPropertyAddresses((prevState) => ({
                ...prevState,
                [uuid()]: ''
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
                return {
                  ...acc,
                  [key]: e[key]
                };
              }, {})
            );

            setIsSubmitProperties(true);
          }}
        >
          {Object.keys(propertyAddresses).map((key, index) => (
            <div>
              <Form.Item
                label={`Property-${index + 1}`}
                name={key}
                rules={[
                  {
                    required: true,
                    message: 'Please input your address!'
                  }
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
  );
};
