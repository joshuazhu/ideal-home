import './App.css';
import { useState } from 'react';
import { MapComponent } from './components/Map/map.comp';
import { SearchPanelComponent } from './components/SearchPanel/searchPanel.comp';
import { APIProvider } from '@vis.gl/react-google-maps';
import { DEFAULT_POSITION } from './const';
import { Property } from './models';
import { GlobalContextProvider } from './components/Context/globalContext';
import { SideBarComponent } from './components/SideBar/SideBar.component';

function App() {
  const [center, setCenter] =
    useState<google.maps.LatLngLiteral>(DEFAULT_POSITION);
  const [polygonPaths, setPolygonPaths] = useState<string[]>([]);
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [properties, setProperties] = useState<Property[]>([
    {
      address: '14 Greenwood Ave, Ringwood VIC 3134',
      coordinates: [-37.812, 145.231],
      detailedAddress: {
        streetNumber: '14',
        streetName: 'Greenwood',
        streetType: 'Ave',
        suburb: 'Ringwood',
        unitNumber: '',
        stateCode: 'VIC',
        postCode: '3134'
      },
      details: {
        beds: 4,
        baths: 3,
        carSpaces: 2,
        landSizeUnit: 'squareMeter',
        guesstimate: {
          price: 1140000,
          calculationDate: '2024-10-07',
          errorRate: 0.12,
          fromPrice: 1100000,
          toPrice: 1200000,
          confidence: 'Medium'
        },
        links: [
          {
            rel: 'self',
            href: 'https://api-gateway-alb.cnsr-onthehouse-prod.aws.corelogic.io:443/properties/9631638'
          },
          {
            rel: 'mainImage',
            href: 'https://das-web.corelogic.asia/v1/asset/AMTHYUDRPAI6XGSZ7EGHZD46PY/resize;m=exact;w=470;h=313'
          },
          {
            rel: 'othWebUrl',
            href: 'https://www.onthehouse.com.au/property/vic/ringwood-3134/14-greenwood-ave-ringwood-vic-3134-9631638'
          }
        ]
      }
    }
  ]);

  return (
    <GlobalContextProvider>
      <APIProvider
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
        libraries={['places']}
        region='AU'
      >
        <div className='App'>
          <div className='flex flex-row'>
            <div className='search-panel basis-1/4'>
              <SideBarComponent/>
            </div>

            <div className='map-container basis-3/4'>
              <MapComponent/>
            </div>
          </div>
        </div>
      </APIProvider>
    </GlobalContextProvider>
  );
}

export default App;
