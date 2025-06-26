import React from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const LoadSheddingPage = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Box
      minH="100vh"
      backgroundImage="linear-gradient(to bottom right, #FF8C42, #4A00E0)"
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "rgba(0, 0, 0, 0.5)",
        zIndex: 1,
      }}
    >
      <Container maxW="container.xl" py={8} position="relative" zIndex={2}>
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          mb={8}
          onClick={() => navigate('/home')}
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          Back to Home
        </Button>
        
        <VStack spacing={8} align="stretch">
          <Heading size="xl" color="white">Load Shedding Schedule</Heading>
          <Box p={6} bg={cardBg} shadow="md" borderRadius="lg">
            <Heading size="md" mb={4}>Coming Soon</Heading>
            <Box>Load shedding schedule and features will be available soon.</Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default LoadSheddingPage;
