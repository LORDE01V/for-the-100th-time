import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, FormControl, FormLabel, Select, useColorModeValue } from '@chakra-ui/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const tileOptions = [
  {
    name: 'Light',
    value: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: 'Dark',
    value: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; OpenStreetMap contributors'
  },
  {
    name: 'Satellite',
    value: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
];

const mockLocations = [
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, summary: '200 homes powered' },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, summary: '150 homes supported' },
  { name: 'Durban', lat: -29.8587, lng: 31.0218, summary: '80 homes connected' },
  { name: 'Soweto', lat: -26.2678, lng: 27.8585, summary: '350 households engaged' },
  { name: 'Pretoria', lat: -25.7479, lng: 28.2293, summary: '180 solar installations' },
  { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022, summary: '120 energy solutions' },
  { name: 'East London', lat: -33.0292, lng: 27.8546, summary: '90 community hubs' },
  { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596, summary: '65 microgrids deployed' },
  { name: 'Pietermaritzburg', lat: -29.6007, lng: 30.3796, summary: '110 smart meters' },
  { name: 'Kimberley', lat: -28.7282, lng: 24.7499, summary: '45 solar farms' },
  { name: 'Polokwane', lat: -23.8965, lng: 29.4486, summary: '75 energy kits' },
  { name: 'Rustenburg', lat: -25.6544, lng: 27.2429, summary: '95 solar water pumps' },
  { name: 'Nelspruit', lat: -25.4745, lng: 30.9703, summary: '60 community centers' },
  { name: 'Mahikeng', lat: -25.8652, lng: 25.6442, summary: '40 power stations' },
  { name: 'Mitchells Plain', lat: -34.0444, lng: 18.6107, summary: '220 households' },
  { name: 'Khayelitsha', lat: -34.0500, lng: 18.6833, summary: '300 energy grants' },
  { name: 'Alexandra', lat: -26.1174, lng: 28.0856, summary: '180 solar loans' }
];

const ImpactMapPreview = () => {
  const [mapTheme, setMapTheme] = useState(tileOptions[0].value);
  
  // Get theme values at component level
  const optionBg = useColorModeValue('white', 'var(--chakra-colors-gray-700)');
  const optionColor = useColorModeValue('gray.800', 'white');

  return (
    <Box 
      p={4} 
      borderRadius="lg" 
      bg={useColorModeValue('whiteAlpha.800', 'gray.800')}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'whiteAlpha.300')}
      boxShadow="md" 
      mt={6}
      position="relative"
      zIndex={1}
    >
      <FormControl mb={4}>
        <FormLabel color={useColorModeValue('gray.700', 'whiteAlpha.900')}>
          Map Theme
        </FormLabel>
        <Select
          value={mapTheme}
          onChange={(e) => setMapTheme(e.target.value)}
          bg={useColorModeValue('white', 'gray.700')}
          borderColor={useColorModeValue('gray.200', 'whiteAlpha.300')}
          color={useColorModeValue('gray.800', 'whiteAlpha.900')}
          _focus={{ borderColor: useColorModeValue('teal.500', 'teal.300') }}
        >
          {tileOptions.map((theme) => (
            <option 
              key={theme.name} 
              value={theme.value}
              style={{
                backgroundColor: optionBg,
                color: optionColor
              }}
            >
              {theme.name} Theme
            </option>
          ))}
        </Select>
      </FormControl>

      <MapContainer
        center={[-28.4796, 24.6981]}
        zoom={5.5}
        style={{ height: '500px', borderRadius: '8px' }}
        scrollWheelZoom={false}
        bounds={[
          [-34.0444, 18.6107],
          [-23.8965, 31.0218]
        ]}
      >
        <TileLayer
          key={mapTheme}
          url={mapTheme}
          attribution={tileOptions.find(t => t.value === mapTheme)?.attribution}
        />
        {mockLocations.map((location, index) => (
          <Marker key={index} position={[location.lat, location.lng]}>
            <Popup>
              <strong>{location.name}</strong><br />
              {location.summary}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default ImpactMapPreview;