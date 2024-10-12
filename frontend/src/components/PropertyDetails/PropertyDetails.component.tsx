import { Flex, Image, Slider } from 'antd';
import { useGlobalContext } from '../Context/globalContext';
import { BedIcon } from '../../icons/BedIcon';
import { ShowerIcon } from '../../icons/ShowerIcon';
import { CarIcon } from '../../icons/CarIcon';
import { toMillionDollars } from '../../utils';
import { IconProps } from '../../icons/IconProps.model';
import { Property } from '../../models';

const HouseSpec = ({
  Icon,
  label
}: {
  Icon: React.FC<IconProps>;
  label: string | number;
}) => (
  <>
    <Flex>
      <div className='pr-1'>
        <Icon width={24} />
      </div>
      <div className='font-semibold'>{label} </div>
    </Flex>
  </>
);

const PriceEstimate = ({
  from,
  to,
  price
}: {
  from: number;
  to: number;
  price: number;
}) => {
  const estimatePricePercentage = Math.floor(
    ((price - from) / (to - from)) * 100
  );
  return (
    <Slider
      disabled={true}
      className='w-5/6 font-bold'
      marks={{
        0: toMillionDollars(from),
        [estimatePricePercentage]: toMillionDollars(price),
        100: toMillionDollars(to)
      }}
      included={false}
      defaultValue={estimatePricePercentage}
    />
  );
};

export const PropertyDetailsComponent = () => {
  const { selectedProperty } = useGlobalContext();

  if (
    !selectedProperty ||
    !selectedProperty.details ||
    !selectedProperty.detailedAddress
  )
    return null;

  const { details, detailedAddress } = selectedProperty;
  const { beds, baths, carSpaces, guesstimate, links } = details;
  const { fromPrice, toPrice, price } = guesstimate;
  const { streetNumber, streetName, streetType, suburb, stateCode, postCode } =
    detailedAddress;

  return (
    <div>
      <div className='mb-4'>
        <Image src={links.find((x) => x.rel === 'mainImage')?.href} />
      </div>
      <Flex vertical align='start'>
        <div className='text-[28px] mb-1 font-semibold'>
          {streetNumber} {streetName} {streetType}
        </div>
        <div className='text-[16px] mb-3 font-semibold'>
          {suburb} {stateCode} {postCode}
        </div>
      </Flex>
      <Flex gap='middle' justify='flex-start' className='mb-4'>
        <HouseSpec Icon={BedIcon} label={beds} />
        <HouseSpec Icon={ShowerIcon} label={baths} />
        <HouseSpec Icon={CarIcon} label={carSpaces} />
      </Flex>

      <Flex vertical>
        <Flex className='text-[16px] mb-1 font-semibold'>Estimated Value</Flex>
        <Flex align='center' className='pl-4'>
          <PriceEstimate from={fromPrice} to={toPrice} price={price} />
        </Flex>
      </Flex>
    </div>
  );
};
