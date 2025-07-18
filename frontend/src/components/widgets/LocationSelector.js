import React, { useState, useContext, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Input,
  List,
  ListItem,
  Select,
  IconButton,
  HStack,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { DashboardContext } from '../../context/DashboardContext';

const AREA_OPTIONS = [
  { id: 'johannesburg', name: 'Johannesburg' },
  { id: 'capetown', name: 'Cape Town' },
  { id: 'durban', name: 'Durban' },
  { id: 'pretoria', name: 'Pretoria' },
  { id: 'bloemfontein', name: 'Bloemfontein' },
  { id: 'portelizabeth', name: 'Port Elizabeth' },
  { id: 'eastlondon', name: 'East London' },
  { id: 'polokwane', name: 'Polokwane' },
  { id: 'nelspruit', name: 'Nelspruit' },
  { id: 'kimberley', name: 'Kimberley' },
  { id: 'pietermaritzburg', name: 'Pietermaritzburg' },
  { id: 'george', name: 'George' },
];

// Debounce utility function
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const LocationSelector = ({ onLocationChange }) => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownValue, setDropdownValue] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [eskomAreas, setEskomAreas] = useState([]);
  const [eskomAreaLoading, setEskomAreaLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [eskomAreaError, setEskomAreaError] = useState("");

  const { selectEskomArea } = useContext(DashboardContext);

  // Function to fetch address suggestions from backend proxy
  const fetchAddressSuggestions = async (query) => {
    setSuggestions([]);
    setGeoError("");
    if (query.length < 3) {
      return;
    }
    try {
      // Call your backend proxy for Nominatim
      const resp = await axios.get('http://localhost:5000/api/nominatim-search', {
        params: {
          q: query,
          countrycodes: 'za',
          limit: 5,
        }
      });
      if (resp.data.error) {
        setGeoError(resp.data.error);
        setSuggestions([]);
      } else {
        setSuggestions(resp.data || []);
      }
    } catch (err) {
      setSuggestions([]);
      console.error("Nominatim proxy API error:", err);
      setGeoError("Failed to fetch address suggestions. Please try again later.");
    }
  };

  // Debounced version of fetchAddressSuggestions
  const debouncedFetchAddressSuggestions = useCallback(
    debounce((query) => fetchAddressSuggestions(query), 500),
    []
  );

  // Address autocomplete input change handler
  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    setEskomAreas([]); // Clear Eskom areas when typing a new address
    setEskomAreaError("");
    debouncedFetchAddressSuggestions(value); // Use debounced function
  };

  // When user picks an address, fetch Eskom areas for that address
  const handleSuggestionClick = async (suggestion) => {
    setAddress(suggestion.display_name);
    setSuggestions([]);
    setDropdownValue('');
    setEskomAreaLoading(true);
    setEskomAreas([]);
    setEskomAreaError("");
    setGeoError("");
    try {
      const resp = await axios.get('http://localhost:5000/api/areas', { params: { text: suggestion.display_name } });
      if (resp.data.error) {
        setEskomAreaError(resp.data.error);
        setEskomAreas([]);
      } else {
        setEskomAreas(resp.data.areas || []);
        console.log("Eskom areas set:", resp.data.areas);
        if (!resp.data.areas || resp.data.areas.length === 0) {
          setEskomAreaError("No Eskom areas found for that address.");
        }
      }
    } catch (err) {
      setEskomAreas([]);
      setEskomAreaError("Failed to fetch Eskom areas for that address. Please try again later.");
      console.error("Failed to fetch Eskom areas from backend:", err);
    }
    setEskomAreaLoading(false);
    onLocationChange && onLocationChange({
      type: 'coords',
      latitude: suggestion.lat,
      longitude: suggestion.lon,
      label: suggestion.display_name,
    });
  };

  // Function to fetch Eskom areas for a selected city from dropdown
  const fetchEskomAreasForCity = async (cityId) => {
    setEskomAreaLoading(true);
    setEskomAreas([]);
    setEskomAreaError("");
    setGeoError("");
    const selected = AREA_OPTIONS.find(opt => opt.id === cityId);
    if (selected) {
      try {
        const resp = await axios.get('http://localhost:5000/api/areas', { params: { text: selected.name } });
        if (resp.data.error) {
          setEskomAreaError(resp.data.error);
          setEskomAreas([]);
        } else {
          setEskomAreas(resp.data.areas || []);
          console.log("Eskom areas set:", resp.data.areas);
          if (!resp.data.areas || resp.data.areas.length === 0) {
            setEskomAreaError("No Eskom areas found for this city.");
          }
        }
      } catch (err) {
        setEskomAreas([]);
        setEskomAreaError("Failed to fetch Eskom areas for this city. Please try again later.");
        console.error("Failed to fetch Eskom areas from backend:", err);
      }
      onLocationChange && onLocationChange({
        type: 'area',
        areaId: selected.id,
        label: selected.name,
      });
    }
    setEskomAreaLoading(false);
  };

  // Debounced version of fetchEskomAreasForCity
  const debouncedFetchEskomAreasForCity = useCallback(
    debounce((cityId) => fetchEskomAreasForCity(cityId), 500),
    []
  );

  // When user selects a city from dropdown
  const handleDropdownChange = (e) => {
    const value = e.target.value;
    setDropdownValue(value);
    setAddress('');
    setSuggestions([]);
    debouncedFetchEskomAreasForCity(value); // Use debounced function
  };

  // When user picks an Eskom area, set areaId in context
  const handleEskomAreaClick = (area) => {
    setEskomAreas([]);
    setAddress(area.name); // Set address input to selected Eskom area name
    selectEskomArea(area);
    setEskomAreaError("");
    setGeoError("");
  };

  // When user uses geolocation, fetch Eskom areas for those coordinates
  const handleGeolocate = async () => {
    setGeoLoading(true);
    setDropdownValue('');
    setAddress('');
    setSuggestions([]);
    setEskomAreas([]);
    setGeoError("");
    setEskomAreaError("");
    
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoLoading(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setEskomAreaLoading(true);
        try {
          // Call your backend proxy for Eskom areas using lat/lon (if your /api/areas handles it,
          // otherwise you might need a dedicated /api/areas/nearby endpoint)
          // Based on your app.py, /api/areas expects 'text'. So we'll pass lat,lon as text.
          // If your backend's /api/loadshedding endpoint handles lat/lon directly, you could use that.
          const resp = await axios.get('http://localhost:5000/api/areas', { params: { text: `${lat},${lon}` } });
          if (resp.data.error) {
            setEskomAreaError(resp.data.error);
            setEskomAreas([]);
          } else {
            setEskomAreas(resp.data.areas || []);
            console.log("Eskom areas set (geolocation):", resp.data.areas);
            if (!resp.data.areas || resp.data.areas.length === 0) {
              setEskomAreaError("No Eskom areas found for your location.");
            }
          }
        } catch (err) {
          setEskomAreas([]);
          setEskomAreaError("Failed to fetch Eskom areas for your location. Please try again later.");
          console.error("Failed to fetch Eskom areas from backend (geolocation):", err);
        }
        setEskomAreaLoading(false);
        onLocationChange && onLocationChange({
          type: 'coords',
          latitude: lat,
          longitude: lon,
          label: 'Your Location',
        });
      },
      (err) => {
        setGeoLoading(false);
        setGeoError("Could not get your location. Please enable location services in your browser.");
        console.error("Geolocation error:", err);
      }
    );
  };

  return (
    <>
      <Box
        mb={6}
        width="100%"
        maxWidth="700px"
        mx="auto"
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        p={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="70px"
        border="2px solid #CBD5E0"
        zIndex={2}
        position="relative"
      >
        <HStack spacing={3} width="100%" alignItems="center">
          <Select
            placeholder="Select city"
            value={dropdownValue}
            onChange={handleDropdownChange}
            width="220px"
            minWidth="180px"
            maxWidth="240px"
            height="48px"
            bg="white"
            color="black"
            borderColor="gray.300"
            fontWeight="bold"
            fontSize="md"
            flexShrink={0}
            _placeholder={{ color: "gray.500" }}
            _focus={{ borderColor: "teal.400", boxShadow: "outline" }}
          >
            {AREA_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id} style={{ color: "black" }}>{opt.name}</option>
            ))}
          </Select>
          <Input
            placeholder="Or search your home address"
            value={address}
            onChange={handleAddressInputChange} // Use the new debounced handler
            width="100%"
            minWidth="220px"
            height="48px"
            bg="white"
            color="black"
            borderColor="gray.300"
            fontWeight="bold"
            fontSize="md"
            _placeholder={{ color: "gray.500" }}
            _focus={{ borderColor: "teal.400", boxShadow: "outline" }}
          />
          <Tooltip label="Use My Location" hasArrow>
            <IconButton
              icon={<FaMapMarkerAlt />}
              onClick={handleGeolocate}
              isLoading={geoLoading}
              aria-label="Use My Location"
              bg="teal.400"
              color="white"
              fontSize="2xl"
              borderRadius="md"
              height="48px"
              minW="48px"
              _hover={{ bg: "teal.500" }}
              size="lg"
              ml={1}
            />
          </Tooltip>
        </HStack>
        {/* Address suggestions (from Nominatim) */}
        {suggestions.length > 0 && (
          <List
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            mt={1}
            zIndex={10}
            position="absolute"
            // Adjust width to fit
            width="calc(100% - 280px)"
            top="70px"
            left="250px"
            border="1px solid #e2e8f0"
            maxH="200px"
            overflowY="auto"
          >
            {suggestions.map((s, idx) => (
              <ListItem
                key={idx}
                px={3}
                py={2}
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                onClick={() => handleSuggestionClick(s)}
                color="black"
              >
                {s.display_name}
              </ListItem>
            ))}
          </List>
        )}
        {/* Eskom area suggestions (from /api/areas) */}
        {eskomAreaLoading && (
          <Box mt={2} color="gray.500" fontSize="sm" position="absolute" top="70px" left="600px">
            <Spinner size="sm" mr={2} />Searching Eskom areas...
          </Box>
        )}
        {eskomAreas.length > 0 && (
          <List
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            mt={1}
            zIndex={20}
            position="absolute"
            width="350px"
            top="120px"
            left="250px"
            border="1px solid #e2e8f0"
            maxH="200px"
            overflowY="auto"
          >
            {eskomAreas.map((area, idx) => (
              <ListItem
                key={area.id}
                px={3}
                py={2}
                _hover={{ bg: "teal.50", cursor: "pointer" }}
                onClick={() => handleEskomAreaClick(area)}
                color="black"
              >
                <b>{area.name}</b> <span style={{ color: "#888" }}>({area.region})</span>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      {/* Display general geolocation/address search errors */}
      {geoError && (
        <Alert status="error" mt={2} borderRadius="md">
          <AlertIcon />
          {geoError}
        </Alert>
      )}
      {/* Display Eskom area specific errors (e.g., 429 Too Many Requests) */}
      {eskomAreaError && (
        <Alert status="warning" mt={2} borderRadius="md">
          <AlertIcon />
          {eskomAreaError}
        </Alert>
      )}
    </>
  );
};

export default LocationSelector;
