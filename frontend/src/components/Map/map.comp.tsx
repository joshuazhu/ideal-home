import { AdvancedMarker, InfoWindow, Map } from '@vis.gl/react-google-maps';
import { Polygon } from './polygon';
import { DEFAULT_POSITION } from '../../const';
import { useGlobalContext } from '../Context/globalContext';

export const MapComponent = () => {
  const {
    suburb,
    mapCenter,
    properties,
  } = useGlobalContext()

  return (
    <Map
      defaultCenter={DEFAULT_POSITION}
      center={mapCenter}
      defaultZoom={14}
      mapId={process.env.REACT_APP_GOOGLE_MAP_ID}
      style={{ width: '100%', height: '100vh' }}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
    >
      <Polygon strokeWeight={1.5} encodedPaths={suburb.polygonPaths} />
      <AdvancedMarker position={mapCenter || DEFAULT_POSITION} />
      {properties.map(({ coordinates, address }, index) => (
        <InfoWindow
          key={index}
          position={{ lat: coordinates[0], lng: coordinates[1] }}
          maxWidth={200}
          headerContent={<h3>{address}</h3>}
        >
        </InfoWindow>
      ))}
    </Map>
  );
};
