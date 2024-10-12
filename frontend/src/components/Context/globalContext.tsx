import { createContext, useContext, useState } from 'react';
import { Coordinates, Property, Suburb } from '../../models';
import { DEFAULT_POSITION } from '../../const';

export const DEFAULT_SUBURB: Suburb = {
  name: 'Melbourne',
  address: '',
  coordinates: DEFAULT_POSITION,
  polygonPaths: []
};

export type GlobalContextType = {
  suburb: Suburb;
  setSuburb: (suburb: Suburb) => void;
  mapCenter: Coordinates;
  setMapCenter: (coordinates: Coordinates) => void;
  properties: Property[];
  setProperties: (properties: Property[]) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  suburb: {
    name: 'Melbourne',
    address: '',
    coordinates: DEFAULT_POSITION,
    polygonPaths: []
  },
  setSuburb: () => {},
  mapCenter: DEFAULT_POSITION,
  setMapCenter: () => {},
  properties: [],
  setProperties: () => {}
});

export const useProvideGlobalContext = () => {
  const [suburb, setSuburb] = useState<Suburb>(DEFAULT_SUBURB);

  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_POSITION);
  const [properties, setProperties] = useState<Property[]>([]);

  const globalContext = {
    suburb,
    setSuburb,
    mapCenter,
    setMapCenter,
    properties,
    setProperties
  };

  return globalContext;
};

export const GlobalContextProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const globalContext = useProvideGlobalContext();

  return (
    <GlobalContext.Provider value={globalContext}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
