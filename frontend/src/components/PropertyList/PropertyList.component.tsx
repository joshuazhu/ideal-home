import { Collapse, Divider } from 'antd';
import { useGlobalContext } from '../Context/globalContext';
import { searchByAddress } from '../../requests/propertyDetails';
import { PropertyDetailsComponent } from '../PropertyDetails/PropertyDetails.component';

export const PropertyListComponent = () => {
  const { setSelectedProperty, selectedProperty, properties } =
    useGlobalContext();

  if(!properties || properties.length === 0) return null;

  const PropertiesCollapse = () => {
    return (
      <Collapse
        items={properties.map((property) => ({
          key: property.address,
          label: property.address,
          children: <PropertyDetailsComponent />
        }))}
        onChange={async (address) => {
          if (address) {
            const property = properties.find(
              (property) => property.address === address[0]
            );

            if (!property || !property.detailedAddress) return;

            const propertyDetails = await searchByAddress(
              property.detailedAddress
            );

            setSelectedProperty({
              ...property,
              details: propertyDetails
            });
          }
        }}
        defaultActiveKey={selectedProperty?.address}
      />
    );
  };

  return (
    <>
      <Divider>Property Details</Divider>
      <PropertiesCollapse></PropertiesCollapse>
    </>
  );
};
