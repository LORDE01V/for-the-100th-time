import React, { useState, useEffect } from 'react';
import {
  Text,
  SimpleGrid,
  useColorModeValue,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaCloudSun, FaCloud, FaBolt } from 'react-icons/fa';
import DashboardCard from '../DashboardCard';

const DailyForecast = ({ location }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const [dailyForecast, setDailyForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const currentHour = new Date().getHours();

  useEffect(() => {
    // Get user location on mount
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }),
        (err) => {
          // If denied, fallback to selectedArea
          setUserLocation(null);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchDailyForecast = async () => {
      if (!location || !location.type) {
        setError("Please select an area, search an address, or allow location access.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let url = '';
        if (location && location.type === 'coords') {
          url = `http://localhost:5000/api/weather?lat=${location.latitude}&lon=${location.longitude}`;
        } else if (location && location.type === 'area') {
          url = `http://localhost:5000/api/weather?areaId=${location.areaId}`;
        } else {
          setError("Please select an area, search an address, or allow location access.");
          setLoading(false);
          return;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.daily_forecast && Array.isArray(data.daily_forecast)) {
          const formattedForecast = data.daily_forecast.map(day => {
            let iconType = 'sun';
            if (day.temperature_2m_max < 15) iconType = 'cloud';
            if (day.uv_index_max > 7) iconType = 'sun';
            if (new Date(day.sunrise).getHours() === currentHour) iconType = 'sunrise';
            if (new Date(day.sunset).getHours() === currentHour) iconType = 'sunset';

            const usage = day.sunshine_duration ? Math.min(100, Math.round((day.sunshine_duration / 36000) * 100)) : 0;

            return {
              hour: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
              usage: usage,
              icon: iconType,
              tempMax: day.temperature_2m_max,
              tempMin: day.temperature_2m_min,
              uvIndex: day.uv_index_max,
            };
          });
          setDailyForecast(formattedForecast);
        } else {
          setError("Invalid data format received from weather API.");
        }
      } catch (e) {
        console.error("Failed to fetch daily forecast:", e);
        setError("Failed to load daily energy forecast. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDailyForecast();
  }, [location]);

  const getIcon = (icon) => {
    switch (icon) {
      case 'sun':
        return FaSun;
      case 'moon':
        return FaMoon;
      case 'sunrise':
      case 'sunset':
        return FaCloudSun;
      case 'cloud':
        return FaCloud;
      case 'thunderstorm':
        return FaBolt;
      default:
        return FaSun;
    }
  };

  if (loading) {
    return (
      <DashboardCard title="Daily Energy Forecast" icon={FaSun}>
        <VStack spacing={4} justify="center" align="center" minH="150px">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading daily forecast...</Text>
        </VStack>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title="Daily Energy Forecast" icon={FaSun}>
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Daily Energy Forecast"
      icon={FaSun}
    >
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
        {dailyForecast.map((slot, index) => {
          const Icon = getIcon(slot.icon);
          const isToday = index === 0;

          return (
            <VStack
              key={slot.hour}
              p={3}
              bg={isToday ? 'blue.50' : 'transparent'}
              borderRadius="lg"
              borderWidth={isToday ? '2px' : '1px'}
              borderColor={isToday ? 'blue.500' : 'gray.200'}
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.05)' }}
            >
              <Icon size="24px" color={isToday ? 'blue.500' : 'gray.500'} />
              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                {slot.hour}
              </Text>
              <Text fontSize="xs" color={textColor}>
                Max: {slot.tempMax}°C
              </Text>
              <Text fontSize="xs" color={textColor}>
                Min: {slot.tempMin}°C
              </Text>
              <Text fontSize="xs" color={textColor}>
                UV: {slot.uvIndex}
              </Text>
              <Text fontSize="xs" color={textColor}>
                Usage: {slot.usage}%
              </Text>
            </VStack>
          );
        })}
      </SimpleGrid>
      <Text mt={4} fontSize="sm" color={textColor} textAlign="center">
        Forecast for the next {dailyForecast.length} days.
      </Text>
    </DashboardCard>
  );
};

export default DailyForecast; 