import React from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

const FaultDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const panel = location.state?.panel;

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!panel) {
    return (
      <Box
        bg={cardBg}
        borderRadius="lg"
        boxShadow="md"
        borderWidth="1px"
        borderColor={borderColor}
        p={6}
        textAlign="center"
      >
        <Heading as="h3" size="md" mb={4}>
          Fault Details Not Found
        </Heading>
        <Button colorScheme="blue" onClick={() => navigate('/dashboard')}>
          Go Back to Dashboard
        </Button>
      </Box>
    );
  }

  const faultDescriptions = {
    1: {
      details: 'Panel efficiency has dropped significantly due to dirt accumulation.',
      measures: [
        'Clean the panel surface with a soft cloth and water.',
        'Ensure no shadows are cast on the panel during peak hours.',
      ],
    },
    2: {
      details: 'Panel wiring has been damaged, causing reduced power output.',
      measures: [
        'Inspect the wiring for visible damage.',
        'Replace damaged wires with new ones.',
        'Contact a certified technician for assistance.',
      ],
    },
    3: {
      details: 'Panel efficiency has dropped due to overheating.',
      measures: [
        'Ensure proper ventilation around the panel.',
        'Check for any obstructions blocking airflow.',
        'Install a cooling system if necessary.',
      ],
    },
  };

  const faultDetail = faultDescriptions[panel.id] || {
    details: 'No specific details available for this fault.',
    measures: ['Contact support for further assistance.'],
  };

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      p={6}
      maxW="800px"
      mx="auto"
      mt={8}
    >
      <Heading as="h3" size="md" mb={4}>
        Fault Details for Panel ID: {panel.id}
      </Heading>
      <Text mb={4}><strong>Status:</strong> {panel.status}</Text>
      <Text mb={4}><strong>Efficiency:</strong> {panel.efficiency}</Text>
      <Text mb={4}><strong>Details:</strong> {faultDetail.details}</Text>
      <Text mb={4}><strong>Measures to Fix:</strong></Text>
      <VStack align="start" spacing={2}>
        {faultDetail.measures.map((measure, index) => (
          <Text key={index}>- {measure}</Text>
        ))}
      </VStack>
      <Button colorScheme="blue" mt={4} onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default FaultDetails;