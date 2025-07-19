import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  VStack,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';
import DashboardCard from '../DashboardCard';
import { DashboardContext } from '../../context/DashboardContext';

const LoadsheddingStatus = () => {
  const { selectedAreaId } = useContext(DashboardContext);
  const [nationalStage, setNationalStage] = useState(null);
  const [areaData, setAreaData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

  // Fetch national stage
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

  // Fetch area schedule when area changes
  useEffect(() => {
    if (!selectedAreaId) {
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
        const res = await fetch(`https://developer.sepush.co.za/business/2.0/area?id=${selectedAreaId}`, {
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
  }, [selectedAreaId]);

  if (!selectedAreaId) {
        return (
            <DashboardCard title="Loadshedding Status" icon={FaInfoCircle}>
        <Text>Please select a location using the selector above to see loadshedding status.</Text>
            </DashboardCard>
        );
    }

  if (loading) {
    return (
      <DashboardCard title="Loadshedding Status" icon={FaInfoCircle}>
                    <VStack py={4}>
                        <Spinner size="md" />
                        <Text>Loading loadshedding data...</Text>
                    </VStack>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title="Loadshedding Status" icon={FaInfoCircle}>
                    <Alert status="error">
                        <AlertIcon />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Loadshedding Status" icon={FaInfoCircle}>
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
        </DashboardCard>
    );
};

export default LoadsheddingStatus;
