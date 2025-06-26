import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';

function AboutPage() {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Call useColorModeValue for the developer card background outside the loop
  const developerCardBg = useColorModeValue('gray.100', 'gray.700');

  // Developer data
  const developers = [
    { name: 'Kgothatso Mokgashi', role: 'Backend' },
    { name: 'Okuhle Gadla', role: 'Backend' },
    { name: 'Thembelihle Zulu', role: 'Database' },
    { name: 'Mpho Ramokhoase', role: 'Frontend' },
    { name: 'Nkosinathi Radebe', role: 'Frontend' },
  ];

  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <Container
        maxW="container.md"
        p={{ base: 4, md: 8 }}
        bg={cardBg}
        boxShadow="md"
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <HStack justify="space-between" align="center" mb={8}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/home')}
            color={headingColor}
          >
            Back to Home
          </Button>
        </HStack>

        <Heading as="h1" size="xl" color={headingColor} mb={8}>
          About Us
        </Heading>

        {/* Purpose Paragraph */}
        <Text fontSize="lg" color={textColor} mb={10}>
          Welcome to Solar Fintech — a modern solution created to empower communities by combining affordable solar energy and smart financial management. Our goal is to help low-income households and small businesses manage energy usage efficiently, track expenses, and stay powered sustainably.
        </Text>

        {/* Developer Section */}
        <VStack spacing={6} align="stretch">
          <Heading as="h2" size="lg" color={headingColor}>
            Our Team
          </Heading>
          {developers.map((dev, index) => (
            <HStack
              key={index}
              spacing={4}
              p={3}
              bg={developerCardBg}
              borderRadius="md"
              align="center"
            >
              {/* Use ui-avatars for placeholder images */}
              <Avatar
                size="md"
                name={dev.name}
                src={`https://ui-avatars.com/api/?name=${dev.name.replace(/\s+/g, '+')}&background=teal&color=fff`}
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" color={headingColor}>{dev.name}</Text>
                <Text fontSize="sm" color={textColor}>{dev.role}</Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Container>
    </Box>
  );
}

export default AboutPage;
