import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const FaultDetection = () => {
  // Initial dummy data for solar panel statuses
  const initialPanelData = [
    { id: 1, status: 'Operational', efficiency: '95%' },
    { id: 2, status: 'Fault Detected', efficiency: '70%' },
    { id: 3, status: 'Fault Detected', efficiency: '60%' },
  ];

  const [panelData, setPanelData] = useState(initialPanelData);

  // Colors based on status
  const operationalColor = useColorModeValue('green.500', 'green.300');
  const faultColor = useColorModeValue('red.500', 'red.300');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Navigation hook
  const navigate = useNavigate();

  // Simulate live data updates every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random updates to panel statuses and efficiencies
      const updatedPanelData = panelData.map((panel) => {
        const randomEfficiency = Math.floor(Math.random() * 100) + 1; // Random efficiency between 1% and 100%
        const randomStatus = randomEfficiency < 80 ? 'Fault Detected' : 'Operational'; // Fault if efficiency < 80%
        return {
          ...panel,
          efficiency: `${randomEfficiency}%`,
          status: randomStatus,
        };
      });
      setPanelData(updatedPanelData);
    }, 300000); // 300,000 ms = 5 minutes

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [panelData]);

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      p={6}
    >
      <Heading as="h3" size="md" mb={4} textAlign="center">
        Solar Panel Fault Detection
      </Heading>
      <Flex direction="row" gap={4} justify="center" wrap="wrap">
        {panelData.map((panel) => (
          <Box
            key={panel.id}
            p={4}
            borderRadius="md"
            bg={panel.status === 'Operational' ? operationalColor : faultColor}
            color="white"
            boxShadow="sm"
            mb={4}
            width="250px" // Set a fixed width for each card
          >
            <Text fontWeight="bold">Panel ID: {panel.id}</Text>
            <Text>Status: {panel.status}</Text>
            <Text>Efficiency: {panel.efficiency}</Text>
            {panel.status === 'Fault Detected' && (
              <Button
                mt={2}
                colorScheme="blue"
                size="sm"
                onClick={() => navigate('/fault-details', { state: { panel } })} // Pass panel data to FaultDetails page
              >
                View More
              </Button>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default FaultDetection;