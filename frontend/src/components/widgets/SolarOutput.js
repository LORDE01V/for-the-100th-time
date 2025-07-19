import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  VStack,
} from '@chakra-ui/react';
import { FaSun } from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import DashboardCard from '../DashboardCard';

const SolarOutput = ({ location }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEfficiency, setCurrentEfficiency] = useState(0);
  const [peakEfficiency, setPeakEfficiency] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

  // Get user location on mount
  useEffect(() => {
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
    const fetchHourlyForecast = async () => {
      if (!location || !location.latitude || !location.longitude) {
        setError("Please select an area, search an address, or allow location access.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=temperature_2m,relative_humidity_2m&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.hourly && data.hourly.time) {
          const now = new Date();
          const currentHour = now.getHours();
          const today = now.toISOString().slice(0, 10);
          const todayHourlyData = data.hourly.time
            .map((time, idx) => {
              if (!time.startsWith(today)) return null;
              return {
                hour: new Date(time).getHours(),
                output: Math.min(100, Math.max(0, Math.round(data.hourly.temperature_2m[idx] * 2 + (100 - data.hourly.relative_humidity_2m[idx]) / 2))),
              };
            })
            .filter(Boolean);

          setHourlyForecast(todayHourlyData);
          const currentHourData = todayHourlyData.find(item => item.hour === currentHour);
          setCurrentEfficiency(currentHourData ? currentHourData.output : 0);
          const peak = todayHourlyData.reduce((max, item) => Math.max(max, item.output), 0);
          setPeakEfficiency(peak);
        } else {
          setError("Invalid data format received from weather API for hourly forecast.");
        }
      } catch (e) {
        setError("Failed to load solar output data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHourlyForecast();
  }, [location]);

  if (loading) {
    return (
      <DashboardCard title="Solar Output" icon={FaSun}>
        <VStack spacing={4} justify="center" align="center" minH="250px">
          <Spinner size="xl" color="orange.500" />
          <Text>Loading solar output data...</Text>
        </VStack>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title="Solar Output" icon={FaSun}>
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Solar Output"
      icon={FaSun}
      metric={currentEfficiency}
      metricLabel="Current Efficiency"
    >
      <Box h="200px" mt={4}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyForecast}>
            <defs>
              <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFA500" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FFA500" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickFormatter={(value) => `${value}:00`}
              tick={{ fontSize: 12, fill: textColor }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: textColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value) => [`${value}%`, 'Output']}
              labelFormatter={(label) => `Hour ${label}:00`}
            />
            <Area
              type="monotone"
              dataKey="output"
              stroke="#FFA500"
              fillOpacity={1}
              fill="url(#colorOutput)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      <Box mt={4} textAlign="center">
        <Badge
          colorScheme={currentEfficiency >= 70 ? 'green' : 'yellow'}
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {currentEfficiency >= 70 ? 'Optimal' : 'Sub-optimal'} Performance
        </Badge>
        <Text mt={2} fontSize="sm" color={textColor}>
          Peak output: {peakEfficiency}%
        </Text>
      </Box>
    </DashboardCard>
  );
};

export default SolarOutput; 