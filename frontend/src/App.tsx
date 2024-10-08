import './App.css';
import { useState } from 'react';
import { MapComponent } from './components/Map/map.comp';
import { SearchPanelComponent } from './components/SearchPanel/searchPanel.comp';
import { APIProvider } from '@vis.gl/react-google-maps';
import { DEFAULT_POSITION } from './const';
import { Property } from './models';

function App() {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(DEFAULT_POSITION);
  const [polygonPaths, setPolygonPaths] = useState<string[]>([]);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([]);


  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''} libraries={['places']}>
    <div className='App'>
      <div className='flex flex-row'>
        <div className='search-panel basis-1/4'>
          <SearchPanelComponent
            setCenter={setCenter}
            polygonPaths={polygonPaths}
            setPolygonPaths={setPolygonPaths}
            searchAddress={searchAddress}
            setSearchAddress={setSearchAddress}
            setProperties={setProperties}
            properties={properties}
          />
        </div>

        <div className='map-container basis-3/4'>
          <MapComponent center={center} polygonPaths={polygonPaths} properties={properties}/>
        </div>
      </div>
    </div>
    </APIProvider>
  );
}

export default App;
