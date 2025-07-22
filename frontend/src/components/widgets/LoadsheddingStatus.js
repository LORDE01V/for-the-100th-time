/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { Box, Text, Spinner, Alert, AlertIcon, AlertDescription, VStack, Tag, TagLabel } from '@chakra-ui/react';
import { useDashboard } from '../../context/DashboardContext';

const LoadsheddingStatus = () => {
  const { selectedEskomArea } = useDashboard();
  const [nationalStage, setNationalStage] = useState(null);
  const [areaData, setAreaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNationalStage = async () => {
      try {
        const res = await fetch('https://developer.sepush.co.za/business/2.0/status', {
          headers: { 'Token': process.env.REACT_APP_ESKOM_API_KEY }
        });
        const data = await res.json();
        setNationalStage(data.status?.eskom?.stage || null);
      } catch (err) {
        setNationalStage(null);
      }
    };
    fetchNationalStage();
  }, []);

  useEffect(() => {
    if (!selectedEskomArea) {
      setAreaData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setAreaData(null);

    const fetchArea = async () => {
      try {
        const res = await fetch(`https://developer.sepush.co.za/business/2.0/area?id=${selectedEskomArea}`, {
          headers: { 'Token': process.env.REACT_APP_ESKOM_API_KEY }
        });
        if (!res.ok) throw new Error('Failed to fetch area data');
        const data = await res.json();
        setAreaData(data);
      } catch (err) {
        setError('Failed to fetch loadshedding status. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchArea();
  }, [selectedEskomArea]);

  if (!selectedEskomArea) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
        <Text>Please select a location using the selector above to see loadshedding status.</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
        <VStack py={4}>
          <Spinner size="md" />
          <Text>Loading loadshedding data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
      <VStack align="flex-start" spacing={2}>
        <Text fontWeight="bold">National Stage: {nationalStage ? `Stage ${nationalStage}` : 'Unknown'}</Text>
        {areaData && (
          <>
            <Text fontWeight="bold">Area: {areaData.info?.name}</Text>
            <Tag size="lg" colorScheme="teal" borderRadius="full">
              <TagLabel>
                {areaData.status?.stage ? `Current Stage: ${areaData.status.stage}` : 'No stage info'}
              </TagLabel>
            </Tag>
            <Text fontWeight="bold" mt={2}>Upcoming Events:</Text>
            {areaData.events && areaData.events.length > 0 ? (
              areaData.events.map((event, idx) => (
                <Box key={idx} pl={2}>
                  <Text fontSize="sm">
                    {event.note} ({event.start} - {event.end})
                  </Text>
                </Box>
              ))
            ) : (
              <Text fontSize="sm">No upcoming events.</Text>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default LoadsheddingStatus;
