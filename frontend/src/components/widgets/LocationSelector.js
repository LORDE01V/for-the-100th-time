import React, { useState, useContext } from 'react';
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
  Text, // Added Text for error display
  Alert, // Added Alert for error display
  AlertIcon, // Added AlertIcon for error display
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

const LocationSelector = ({ onLocationChange }) => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownValue, setDropdownValue] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [eskomAreas, setEskomAreas] = useState([]);
  const [eskomAreaLoading, setEskomAreaLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [eskomAreaError, setEskomAreaError] = useState(""); // New state for Eskom area specific errors

  const { selectEskomArea } = useContext(DashboardContext);

  // Address autocomplete using Nominatim
  const handleAddressChange = async (e) => {
    setAddress(e.target.value);
    setEskomAreas([]);
    setEskomAreaError(""); // Clear Eskom area error on new search
    setGeoError(""); // Clear general geo error
    if (e.target.value.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: e.target.value,
          countrycodes: 'za',
          format: 'json',
          addressdetails: 1,
          limit: 5,
        }
      });
      setSuggestions(resp.data);
    } catch (err) {
      setSuggestions([]);
      console.error("Nominatim API error:", err);
      setGeoError("Failed to fetch address suggestions.");
    }
  };

  // When user picks an address, fetch Eskom areas for that address
  const handleSuggestionClick = async (suggestion) => {
    setAddress(suggestion.display_name);
    setSuggestions([]);
    setDropdownValue('');
    setEskomAreaLoading(true);
    setEskomAreas([]);
    setEskomAreaError(""); // Clear previous Eskom area error
    setGeoError(""); // Clear general geo error
    try {
      const resp = await axios.get('/api/areas', { params: { text: suggestion.display_name } });
      if (resp.data.error) { // Check for backend error message
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

  // When user picks an Eskom area, set areaId in context
  const handleEskomAreaClick = (area) => {
    setEskomAreas([]);
    setAddress(area.name);
    selectEskomArea(area);
    setEskomAreaError(""); // Clear error once an area is selected
    setGeoError(""); // Clear general geo error
  };

  // When user selects a city from dropdown
  const handleDropdownChange = async (e) => {
    setDropdownValue(e.target.value);
    setAddress('');
    setSuggestions([]);
    setEskomAreas([]);
    setEskomAreaError(""); // Clear Eskom area error on new search
    setGeoError(""); // Clear general geo error
    const selected = AREA_OPTIONS.find(opt => opt.id === e.target.value);
    if (selected) {
      setEskomAreaLoading(true);
      try {
        const resp = await axios.get('/api/areas', { params: { text: selected.name } });
        if (resp.data.error) { // Check for backend error message
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
      setEskomAreaLoading(false);
      onLocationChange && onLocationChange({
        type: 'area',
        areaId: selected.id,
        label: selected.name,
      });
    }
  };

  // When user uses geolocation, fetch Eskom areas for those coordinates
  const handleGeolocate = () => {
    setGeoLoading(true);
    setDropdownValue('');
    setAddress('');
    setSuggestions([]);
    setEskomAreas([]);
    setGeoError("");
    setEskomAreaError(""); // Clear Eskom area error on new search
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoLoading(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setEskomAreaLoading(true);
        try {
          // Use coordinates as text for Eskom API
          const resp = await axios.get('/api/areas', { params: { text: `${lat},${lon}` } });
          if (resp.data.error) { // Check for backend error message
            setEskomAreaError(resp.data.error);
            setEskomAreas([]);
          } else {
            setEskomAreas(resp.data.areas || []);
            console.log("Eskom areas set:", resp.data.areas);
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
            onChange={handleAddressChange}
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
        {/* Address suggestions */}
        {suggestions.length > 0 && (
          <List
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            mt={1}
            zIndex={10}
            position="absolute"
            width="320px"
            top="70px"
            left="250px"
            border="1px solid #e2e8f0"
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
        {/* Eskom area suggestions */}
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
