import { useEffect, useState } from 'react';
import { searchByCoordinates } from '../requests/openStreetMap';

export const useOpenStreetMapAddress = (coordinates: {
  lat: any;
  lng: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const getAddressCoordinates = async () => {
      // if (!coordinates) return;

      setIsLoading(true);
      const data = await searchByCoordinates(coordinates);

      console.log('data', data);

      setIsLoading(false);
    };

    if(coordinates) {
      getAddressCoordinates();
    }

  }, [coordinates]);

  return { coordinates, isLoading, isError, setIsError };
};
