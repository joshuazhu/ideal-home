import './App.css';
import { useState } from 'react';
import { MapComponent } from './components/Map/map.comp';

function App() {
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: -37.813505156854625,
    lng: 144.9642990778334,
  });

  const [suburb, setSuburb] = useState('');

  // Fetch location coordinates by suburb name
  const handleSearch = async () => {
    if (!suburb) return;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${suburb}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      setCenter({ lat: location.lat, lng: location.lng });
    } else {
      alert('Suburb not found');
    }
  };

  return (
    <div className='App'>
      <div className='search-panel'>
        <h3>Search Suburb</h3>
        <input
          type='text'
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          placeholder='Enter suburb name'
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className='map-container'>
        <MapComponent center={center} />
      </div>
    </div>
  );
}

export default App
