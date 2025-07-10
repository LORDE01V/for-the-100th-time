import React, { useState, useEffect } from 'react';
import {
  Text,
  SimpleGrid,
  useColorModeValue,
  VStack,
  Spinner, // Import Spinner for loading state
  Alert, // Import Alert for error messages
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaCloudSun, FaCloud, FaBolt } from 'react-icons/fa'; // Added more icons
import DashboardCard from '../DashboardCard'; // Assuming this path is correct

const DailyForecast = ({ selectedArea }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const [dailyForecast, setDailyForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentHour = new Date().getHours();

  useEffect(() => {
    const fetchDailyForecast = async () => {
      if (!selectedArea || !selectedArea.id) {
        setError("Please select an area to view the daily forecast.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch from your backend's weather endpoint, passing the selected area ID
        const response = await fetch(`http://localhost:5000/api/weather?areaId=${selectedArea.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming your backend returns daily_forecast in the format expected
        if (data.daily_forecast && Array.isArray(data.daily_forecast)) {
          // Map backend data to frontend structure, adding a dummy 'usage' for now
          // You'll need to define how 'usage' is derived from actual weather data
          const formattedForecast = data.daily_forecast.map(day => {
            // Simple logic to determine an icon based on temperature or UV index
            let iconType = 'sun';
            if (day.temperature_2m_max < 15) iconType = 'cloud';
            if (day.uv_index_max > 7) iconType = 'sun'; // High UV
            if (new Date(day.sunrise).getHours() === currentHour) iconType = 'sunrise';
            if (new Date(day.sunset).getHours() === currentHour) iconType = 'sunset';

            // For 'usage', you might need a more complex model based on sunshine duration, UV, etc.
            // For now, let's use a placeholder or derive it simply.
            // Example: Higher sunshine duration means higher potential solar usage
            const usage = day.sunshine_duration ? Math.min(100, Math.round((day.sunshine_duration / 36000) * 100)) : 0; // Convert seconds to hours, max 10 hours for 100%

            return {
              hour: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), // Display date
              usage: usage, // Placeholder, replace with actual energy forecast logic
              icon: iconType, // Determine icon based on weather data
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
  }, [selectedArea]); // Re-run effect when selectedArea changes

  const getIcon = (icon) => {
    switch (icon) {
      case 'sun':
        return FaSun;
      case 'moon': // Although not directly used for daily, kept for consistency
        return FaMoon;
      case 'sunrise':
      case 'sunset':
        return FaCloudSun; // Using CloudSun for sunrise/sunset for visual distinction
      case 'cloud':
        return FaCloud;
      case 'thunderstorm': // Example for future expansion
        return FaBolt;
      default:
        return FaSun;
    }
  };

  // This function is less relevant for daily forecast, but kept for structure if needed
  const isCurrentTimeSlot = (hour) => {
    // For daily forecast, we might highlight 'today' or 'tomorrow'
    // This logic needs to be adapted for daily view
    return false; // No "current time slot" for a daily view in this context
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
          // For a daily forecast, we might highlight today
          const isToday = index === 0;

          return (
            <VStack
              key={slot.hour} // Using date as key
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
                {slot.hour} {/* This will now be the date */}
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
                Usage: {slot.usage}% {/* This is a placeholder for energy forecast */}
              </Text>
            </VStack>
          );
        })}
      </SimpleGrid>
      {/* You might want to add dynamic "best usage time" based on fetched data */}
      <Text mt={4} fontSize="sm" color={textColor} textAlign="center">
        Forecast for the next {dailyForecast.length} days.
      </Text>
    </DashboardCard>
  );
};

export default DailyForecast;
