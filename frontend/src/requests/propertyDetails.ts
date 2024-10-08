import axios from 'axios';

export const searchByAddress = async ({
  suburb,
  postCode,
  streetName,
  streetType,
  unitNumber,
  stateCode = 'VIC',
  streetNumber
}: {
  suburb: string;
  postCode: string;
  streetName: string;
  streetType: string;
  unitNumber: string;
  stateCode?: string;
  streetNumber: string;
}): Promise<any> => {
  const response = await axios({
    method: 'post',
    url: `http://localhost:3020/property`,
    data: {
      stateCode,
      suburb,
      postCode,
      streetName,
      streetType,
      unitNumber,
      streetNumber
    }
  });
  const data = await response.data;
  return data;
};
