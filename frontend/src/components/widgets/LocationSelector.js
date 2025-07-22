import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import {
  Box,
  Input,
  Select,
  IconButton,
  HStack,
  Tooltip,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Static city list with coordinates
const AREA_OPTIONS = [
  { id: 'johannesburg', name: 'Johannesburg', latitude: -26.2041, longitude: 28.0473 },
  { id: 'capetown', name: 'Cape Town', latitude: -33.9249, longitude: 18.4241 },
  { id: 'durban', name: 'Durban', latitude: -29.8587, longitude: 31.0218 },
  { id: 'pretoria', name: 'Pretoria', latitude: -25.7479, longitude: 28.2293 },
  { id: 'bloemfontein', name: 'Bloemfontein', latitude: -29.0852, longitude: 26.1596 },
  { id: 'portelizabeth', name: 'Port Elizabeth', latitude: -33.9608, longitude: 25.6022 },
  { id: 'eastlondon', name: 'East London', latitude: -33.0153, longitude: 27.9116 },
  { id: 'polokwane', name: 'Polokwane', latitude: -23.9045, longitude: 29.4689 },
  { id: 'nelspruit', name: 'Nelspruit', latitude: -25.4658, longitude: 30.9853 },
  { id: 'kimberley', name: 'Kimberley', latitude: -28.7383, longitude: 24.7636 },
  { id: 'pietermaritzburg', name: 'Pietermaritzburg', latitude: -29.6006, longitude: 30.3794 },
  { id: 'george', name: 'George', latitude: -33.9648, longitude: 22.4617 },
];

const LocationSelector = ({ onLocationChange }) => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [dropdownValue, setDropdownValue] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Address autocomplete input change handler
  const fetchAddressSuggestions = async (query) => {
    setSuggestions([]);
    setGeoError("");
    if (query.length < 3) return;
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=za&limit=5`);
      const data = await resp.json();
      setSuggestions(data);
    } catch (err) {
      setGeoError("Failed to fetch address suggestions. Please try again later.");
    }
  };

  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    setSuggestions([]);
    setGeoError("");
    fetchAddressSuggestions(value);
  };

  // When user picks an address, set location to its coordinates
  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion.display_name);
    setSuggestions([]);
    setDropdownValue('');
    setGeoError("");
    onLocationChange && onLocationChange({
      type: 'coords',
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      label: suggestion.display_name,
    });
  };

  // When user selects a city from dropdown
  const handleDropdownChange = (e) => {
    const value = e.target.value;
    setDropdownValue(value);
    setAddress('');
    setSuggestions([]);
    setGeoError("");
    const selected = AREA_OPTIONS.find(opt => opt.id === value);
    if (selected) {
      onLocationChange && onLocationChange({
        type: 'coords',
        latitude: selected.latitude,
        longitude: selected.longitude,
        label: selected.name,
      });
    }
  };

  // When user uses geolocation
  const handleGeolocate = async () => {
    setGeoLoading(true);
    setDropdownValue('');
    setAddress('');
    setSuggestions([]);
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        onLocationChange && onLocationChange({
          type: 'coords',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: 'Your Location',
        });
      },
      (err) => {
        setGeoLoading(false);
        setGeoError("Could not get your location. Please enable location services in your browser.");
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
            onChange={handleAddressInputChange}
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
          <Box
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            mt={1}
            zIndex={10}
            position="absolute"
            width="calc(100% - 280px)"
            top="70px"
            left="250px"
            border="1px solid #e2e8f0"
            maxH="200px"
            overflowY="auto"
          >
            {suggestions.map((s, idx) => (
              <Box
                key={idx}
                px={3}
                py={2}
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                onClick={() => handleSuggestionClick(s)}
                color="black"
              >
                {s.display_name}
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {/* Display general geolocation/address search errors */}
      {geoError && (
        <Alert status="error" mt={2} borderRadius="md">
          <AlertIcon />
          {geoError}
        </Alert>
      )}
    </>
  );
};

export default LocationSelector;

LocationSelector.propTypes = {
  onLocationChange: PropTypes.func.isRequired,
};
