import { useEffect, useRef, useState } from 'react';
import polyline from '@mapbox/polyline';
import {
  getPolygonPathsById,
  searchByCoordinates
} from '../../requests/openStreetMap';
import { Card } from 'antd';
import { useGlobalContext } from '../Context/globalContext';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export const SearchPanelComponent = () => {
  const { setSuburb, setMapCenter } = useGlobalContext();

  // init google autocomplete
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', async () => {
      const place = placeAutocomplete.getPlace();

      if (place.geometry) {
        const location = place.geometry.location;

        if (!location) return;

        const coordinates = {
          lat: location.lat(),
          lng: location.lng()
        };

        const response = await searchByCoordinates(coordinates);
        const osmId = response.osm_id;
        const responsePolygon = await getPolygonPathsById(osmId);

        if (responsePolygon.geometry) {
          const polygonCoordinates = responsePolygon.geometry.coordinates as [
            number,
            number
          ][][];
          const encodedPolygonCoordinates = polygonCoordinates.map((path) =>
            path.map(([lng, lat]) => [lat, lng])
          ) as [number, number][][];

          setSuburb({
            name: place.name || '',
            address: place.formatted_address || '',
            coordinates,
            polygonPaths: encodedPolygonCoordinates.map((path) =>
              polyline.encode(path)
            )
          });
        }
        setMapCenter(coordinates);
      } else {
        alert('No details available for input: ' + place.name);
      }
    });
  }, [placeAutocomplete, setMapCenter, setSuburb]);

  return (
    <>
      <div className='overflow-y-auto max-h-[950px]'>
        <Card title='Search Suburb' className='mb-4'>
          <div className='flex items-center justify-center'>
            <div>
              <input
                ref={inputRef}
                type='text'
                placeholder='Enter your address'
                style={{ width: '300px', padding: '10px' }}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
