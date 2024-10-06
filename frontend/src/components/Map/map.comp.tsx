import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';

export const MapComponent = ({ center }: { center: google.maps.LatLngLiteral }) => {
  //Melbourne coordinates
  const position = { lat: -37.813505156854625, lng: 144.9642990778334 };
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
      <Map
        defaultCenter={position}
        defaultZoom={10}
        mapId={process.env.REACT_APP_GOOGLE_MAP_ID}
        style={{ width: '100%', height: '100vh' }}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        <AdvancedMarker position={position} />
      </Map>
    </APIProvider>
  );
}
