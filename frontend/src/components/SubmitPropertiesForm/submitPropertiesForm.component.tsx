import PlusCircleIcon from '@heroicons/react/16/solid/PlusCircleIcon';
import { Button, Card, Form, Input } from 'antd';
import { v4 as uuid } from 'uuid';
import { getGeoCodingByAddress } from '../../requests/geocoding';
import { useState } from 'react';
import { useGlobalContext } from '../Context/globalContext';

export const SubmitPropertiesFormComponent = () => {
  const { setSuburb, setMapCenter, setProperties, suburb, properties } =
  useGlobalContext();

  const [propertyAddresses, setPropertyAddresses] = useState<
    Record<string, { address: string; coordinates: [number, number] }>
  >({
    'property-1': {
      address: '14 Greenwood Ave, Ringwood VIC 3134',
      coordinates: [-37.812, 145.231]
    }
  });

  if(!suburb.address) return null;

  return (
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

            // setProperties(
            //   properties.filter(Boolean) as {
            //     coordinates: [number, number];
            //     address: string;
            //     detailedAddress: any;
            //   }[]
            // );
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

      {/* {properties.length > 0 && (
              <>
                <Divider>Property Details</Divider>
                <PropertiesCollapse
                  properties={properties}
                ></PropertiesCollapse>
              </>
            )} */}
    </div>
  );
};
