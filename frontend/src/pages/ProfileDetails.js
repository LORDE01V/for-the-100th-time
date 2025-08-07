import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  Button,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import subscriptionsPageBackground from '../assets/images/subscriptions_page.png';

const ProfileDetails = () => {
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');
  const navigate = useNavigate();

  // Styles for the inner Box, ensuring transparency
  const glassmorphismBoxStyles = {
    bg: 'transparent', // Explicitly set background to transparent
    boxShadow: 'none', // Remove box shadow for a cleaner look if wanted, or adjust as needed
    borderRadius: 'xl',
    border: 'none', // Remove border as it might contribute to a visible outline
    color: useColorModeValue('gray.800', 'white'),
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={4}
      backgroundImage={`url(${subscriptionsPageBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
      position="relative"
      _before={{ // Re-adding the semi-transparent overlay
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent overlay for readability
          zIndex: 1,
      }}
    >
      <Box
        maxW="md"
        w="full"
        {...glassmorphismBoxStyles}
        p={6}
        textAlign="center"
        position="relative"
        zIndex={2}
        // Removed backdropFilter here, as it was likely the culprit for the perceived white background
      >
        <HStack justify="start" w="full" mb={4}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/home')}
            color={headingColor}
          >
            Back to Home
          </Button>
        </HStack>
        <Heading as="h1" size="xl" mb={4} color={headingColor}>Profile Details</Heading>
        <Text fontSize="lg" color={textColor}>Update your personal information here.</Text>
      </Box>
    </Flex>
  );
};

export default ProfileDetails;

