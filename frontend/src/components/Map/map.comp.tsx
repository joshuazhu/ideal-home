import { AdvancedMarker, InfoWindow, Map } from '@vis.gl/react-google-maps';
import { Polygon } from './polygon';
import { DEFAULT_POSITION } from '../../const';

export const MapComponent = ({
  center,
  polygonPaths,
  properties
}: {
  center: google.maps.LatLngLiteral;
  polygonPaths: string[];
  properties: {
    coordinates: [number, number];
    address: string;
  }[];
}) => {
  return (
    <Map
      defaultCenter={DEFAULT_POSITION}
      center={center}
      defaultZoom={14}
      mapId={process.env.REACT_APP_GOOGLE_MAP_ID}
      style={{ width: '100%', height: '100vh' }}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
    >
      <Polygon strokeWeight={1.5} encodedPaths={polygonPaths} />
      <AdvancedMarker position={center || DEFAULT_POSITION} />
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
