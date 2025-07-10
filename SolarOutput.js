import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  Badge,
  Spinner, // Import Spinner for loading state
  Alert, // Import Alert for error messages
  AlertIcon,
  AlertDescription,
  VStack, // Added VStack import here
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
import DashboardCard from '../DashboardCard'; // Assuming this path is correct

const SolarOutput = ({ selectedArea }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEfficiency, setCurrentEfficiency] = useState(0);
  const [peakEfficiency, setPeakEfficiency] = useState(0);

  useEffect(() => {
    const fetchHourlyForecast = async () => {
      if (!selectedArea || !selectedArea.id) {
        setError("Please select an area to view solar output.");
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
        // Assuming your backend returns hourly_forecast in the format expected
        if (data.hourly_forecast && Array.isArray(data.hourly_forecast)) {
          const now = new Date();
          const currentHour = now.getHours();

          // Filter for the current day's hourly data and map to chart format
          const todayHourlyData = data.hourly_forecast.filter(item => {
            const itemDate = new Date(item.time);
            return itemDate.getDate() === now.getDate() &&
                   itemDate.getMonth() === now.getMonth() &&
                   itemDate.getFullYear() === now.getFullYear();
          }).map(item => ({
            hour: new Date(item.time).getHours(), // Extract just the hour
            // For 'output', you need to define how temperature/humidity translates to solar output
            // This is a simplified example: higher temp/lower humidity might mean better output
            output: Math.min(100, Math.max(0, Math.round(item.temperature_2m * 2 + (100 - item.relative_humidity_2m) / 2))),
          }));

          setHourlyForecast(todayHourlyData);

          // Calculate current efficiency (e.g., based on the current hour's output)
          const currentHourData = todayHourlyData.find(item => item.hour === currentHour);
          setCurrentEfficiency(currentHourData ? currentHourData.output : 0);

          // Calculate peak efficiency for the day
          const peak = todayHourlyData.reduce((max, item) => Math.max(max, item.output), 0);
          setPeakEfficiency(peak);

        } else {
          setError("Invalid data format received from weather API for hourly forecast.");
        }
      } catch (e) {
        console.error("Failed to fetch hourly forecast:", e);
        setError("Failed to load solar output data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHourlyForecast();
  }, [selectedArea]); // Re-run effect when selectedArea changes

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
