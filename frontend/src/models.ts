export type Suburb = {
  name: string;
  address: string;
  coordinates: Coordinates;
  polygonPaths: string[];
}

export type Property = {
  coordinates: [number, number];
  address: string;
  detailedAddress: {
    streetNumber: string;
    streetName: string;
    streetType: string;
    suburb: string;
    unitNumber: string;
    stateCode: string;
    postCode: string;
  };
  details?: {
    beds: number;
    baths: number;
    carSpaces: number;
    landSizeUnit: string;
    guesstimate: any;
    links: {rel: string, href: string}[];
  }
};

export type Coordinates = {
  lat: number;
  lng: number;
}
