import { useEffect, useRef, useState } from 'react';
import polyline from '@mapbox/polyline';
import { getPolygonPathsById, searchByCoordinates } from '../../requests/openStreetMap';

export const SearchPanelComponent = ({
  setCenter,
  setPolygonPaths,
}: {
  setCenter: ({ lat, lng }: { lat: number; lng: number }) => void;
  setPolygonPaths: (paths: string[]) => void;
  setOpenStreetMapId: (id: string | null) => void;
}) => {
  const [suburb, setSuburb] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);


  useEffect(() => {
    if (!window.google?.maps?.places) {
      console.error('Google Maps Places library not loaded');
      return;
    }
    if (!inputRef.current) return;

    // Initialize the autocomplete functionality
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['(cities)'], // restrict to cities or you can use 'geocode' for addresses
        componentRestrictions: { country: 'au' } // restrict to a country (optional)
      }
    );

    // Add listener for place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (place.geometry) {
        const location = place.geometry.location;

        console.log('Place details:', place, place.geometry.location?.toJSON());
        if (!location) return;

        const coordinates = {
          lat: location.lat(),
          lng: location.lng()
        }

        if (place.geometry.viewport) {
          const bounds = place.geometry.viewport;
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();

          const path = [
            { lat: ne.lat(), lng: ne.lng() },
            { lat: ne.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: ne.lng() },
          ];

          const coordinatesArray = path.map(coord => [coord.lat, coord.lng]) as [number, number][];
          setPolygonPaths([polyline.encode(coordinatesArray)]); // Set the polygon path based on the viewport
        }

        setCenter(coordinates);
        setSelectedCoordinates(coordinates);
      } else {
        alert('No details available for input: ' + place.name);
      }
    });
  }, [window.google]);

  useEffect(() => {
    if (!selectedCoordinates) return;

    const searchAddressByCoordinates = async (
      coordinates: {
        lat: any;
        lng: any;
      }
    ): Promise<any> => {
      const response = await searchByCoordinates(selectedCoordinates);
      const osmId = response.osm_id;

      const responsePolygon = await getPolygonPathsById(osmId);

      console.log('responsePolygon', responsePolygon.geometry.coordinates);
      if(responsePolygon.geometry) {
        const polygonCoordinates = responsePolygon.geometry.coordinates as [number, number][][];
        console.log('polygonCoordinates', polygonCoordinates);
        // setPolygonPaths(polygonCoordinates[0].map(([lng, lat]) => [lat, lng]));
      }
      // setOpenStreetMapId(response.osm_id);
    };

    if(selectedCoordinates) {
      console.log('selectedCoordinates', selectedCoordinates);
      searchAddressByCoordinates(selectedCoordinates);
    }

  }, [selectedCoordinates])

  return (
    <>
      <h3>Search Suburb</h3>
      <input
        type='text'
        value={suburb}
        ref={inputRef}
        onChange={(e) => setSuburb(e.target.value)}
        placeholder='Enter suburb name'
      />
    </>
  );
};
