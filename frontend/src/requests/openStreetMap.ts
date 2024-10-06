export const searchByCoordinates = async (
  coordinates: {
    lat: any;
    lng: any;
  }
): Promise<any> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=15`
  );
  const data = await response.json();
  return data;
};

export const getPolygonPathsById = async (osmId: string): Promise<any> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/details.php?osmtype=R&osmid=${osmId}&addressdetails=1&hierarchy=0&group_hierarchy=1&polygon_geojson=1&format=json`
  );
  const data = await response.json();
  return data;
}
