export const getGeoCodingByAddress = async (
  address: string
): Promise<any> => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address.split(' ').map(part => part.trim()).filter(Boolean).join('+')}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();

  if(data?.results?.length > 0) {
    return data.results[0];
  }

  return null
};


