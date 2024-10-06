import './App.css';
import { useState } from 'react';
import { MapComponent } from './components/Map/map.comp';
import { SearchPanelComponent } from './components/SearchPanel/searchPanel.comp';
import { APIProvider } from '@vis.gl/react-google-maps';

function App() {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: -37.813505156854625,
    lng: 144.9642990778334
  });
  const [openStreetMapId, setOpenStreetMapId] = useState<string | null>(null);
  const [polygonPaths, setPolygonPaths] = useState<string[]>([]);

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''} libraries={['places']}>
    <div className='App'>
      <div className='flex flex-row'>
        <div className='search-panel basis-1/4'>
          <SearchPanelComponent
            setCenter={setCenter}
            setPolygonPaths={setPolygonPaths}
            setOpenStreetMapId={setOpenStreetMapId}
          />
        </div>

        <div className='map-container basis-3/4'>
          <MapComponent center={center} polygonPaths={polygonPaths}/>
        </div>
      </div>
    </div>
    </APIProvider>
  );
}

export default App;
