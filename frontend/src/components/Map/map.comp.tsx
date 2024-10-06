import { AdvancedMarker, GoogleMapsContext, Map, useMapsLibrary } from '@vis.gl/react-google-maps';
import { forwardRef, Ref, useContext, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

type PolygonEventProps = {
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onDrag?: (e: google.maps.MapMouseEvent) => void;
  onDragStart?: (e: google.maps.MapMouseEvent) => void;
  onDragEnd?: (e: google.maps.MapMouseEvent) => void;
  onMouseOver?: (e: google.maps.MapMouseEvent) => void;
  onMouseOut?: (e: google.maps.MapMouseEvent) => void;
};
type PolygonCustomProps = {
  /**
   * this is an encoded string for the path, will be decoded and used as a path
   */
  encodedPaths?: string[];
};

export type PolygonProps = google.maps.PolygonOptions &
  PolygonEventProps &
  PolygonCustomProps;

export type PolygonRef = Ref<google.maps.Polygon | null>;

function usePolygon(props: PolygonProps) {
  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    encodedPaths,
    ...polygonOptions
  } = props;
  // This is here to avoid triggering the useEffect below when the callbacks change (which happen if the user didn't memoize them)
  const callbacks = useRef<Record<string, (e: unknown) => void>>({});
  Object.assign(callbacks.current, {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut
  });

  const geometryLibrary = useMapsLibrary('geometry');

  const polygon = useRef(new google.maps.Polygon()).current;
  // update PolygonOptions (note the dependencies aren't properly checked
  // here, we just assume that setOptions is smart enough to not waste a
  // lot of time updating values that didn't change)
  useMemo(() => {
    polygon.setOptions(polygonOptions);
  }, [polygon, polygonOptions]);

  // update the path with the encodedPath
  useMemo(() => {
    if (!encodedPaths || !geometryLibrary) return;
    const paths = encodedPaths.map((path) =>
      geometryLibrary.encoding.decodePath(path)
    );

    console.log('paths', paths);

    polygon.setPaths(paths);
  }, [polygon, encodedPaths, geometryLibrary]);

  const map = useContext(GoogleMapsContext)?.map;

  // create polygon instance and add to the map once the map is available
  useEffect(() => {
    if (!map) {
      if (map === undefined)
        console.error('<Polygon> has to be inside a Map component.');

      return;
    }

    polygon.setMap(map);

    return () => {
      polygon.setMap(null);
    };
  }, [map]);

  // attach and re-attach event-handlers when any of the properties change
  useEffect(() => {
    if (!polygon) return;

    // Add event listeners
    const gme = google.maps.event;
    [
      ['click', 'onClick'],
      ['drag', 'onDrag'],
      ['dragstart', 'onDragStart'],
      ['dragend', 'onDragEnd'],
      ['mouseover', 'onMouseOver'],
      ['mouseout', 'onMouseOut']
    ].forEach(([eventName, eventCallback]) => {
      gme.addListener(polygon, eventName, (e: google.maps.MapMouseEvent) => {
        const callback = callbacks.current[eventCallback];
        if (callback) callback(e);
      });
    });

    return () => {
      gme.clearInstanceListeners(polygon);
    };
  }, [polygon]);

  return polygon;
}

export const Polygon = forwardRef((props: PolygonProps, ref: PolygonRef) => {
  const polygon = usePolygon(props);

  useImperativeHandle(ref, () => polygon, []);

  return null;
});

export const MapComponent = ({
  center,
  polygonPaths
}: {
  center: google.maps.LatLngLiteral;
  polygonPaths: string[];
}) => {

  //Melbourne coordinates
  const position = { lat: -37.813505156854625, lng: 144.9642990778334 };
  return (
    <Map
      defaultCenter={position}
      defaultZoom={10}
      mapId={process.env.REACT_APP_GOOGLE_MAP_ID}
      style={{ width: '100%', height: '100vh' }}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
    >
      <Polygon strokeWeight={1.5} encodedPaths={polygonPaths} />
      {/* {polygonPath.length > 0 && (
          <Polygon
            paths={polygonPath}
            options={{
              fillColor: '#FF0000',
              fillOpacity: 0.35,
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              clickable: false,
            }}
          />
        )} */}
      <AdvancedMarker position={center || position} />
    </Map>
  );
};
