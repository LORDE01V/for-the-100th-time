/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Flex,
  SimpleGrid,
  Link,
} from '@chakra-ui/react';
import { FaArrowLeft, FaTwitter, FaFacebook, FaInstagram, FaEnvelope } from 'react-icons/fa';
import kgImg from '../assets/images/kg_img.png';         // Kgotatso Mokgashi
import mphoImg from '../assets/images/Mpho.png';         // Mpho Ramokhoase
import liheImg from '../assets/images/Lihle.png';        // Thembelihle Zulu
import nathiImg from '../assets/images/IMG Nathii.jpg';  // Nkosinathi Radebe
import okuhleImg from '../assets/images/sleigh.png';     // Okuhle Gadla
import aboutBg from '../assets/images/About_Page_IMG.png';

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
  const team = [
    {
      name: "Kgotatso Mokgashi",
      role: "Backend",
      avatar: kgImg,
      initials: "KM"
    },
    {
      name: "Okuhle Gadla",
      role: "Backend",
      avatar: okuhleImg,
      initials: "OG"
    },
    {
      name: "Thembelihle Zulu",
      role: "Database",
      avatar: liheImg,
      initials: "TZ"
    },
    {
      name: "Mpho Ramokhoase",
      role: "Frontend",
      avatar: mphoImg,
      initials: "MR"
    },
    {
      name: "Nkosinathi Radebe",
      role: "Frontend",
      avatar: nathiImg,
      initials: "NR"
    }
  ];

  return (
    <Box
      minH="100vh"
      backgroundImage={`url(${aboutBg})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      px={4}
      py={8}
      position="relative"
    >
      {/* Overlay for readability */}
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        bg="rgba(20, 20, 30, 0.85)"
        zIndex={0}
      />
      {/* Content */}
      <Box maxW="800px" mx="auto" position="relative" zIndex={1} p={8}>
        <Text fontSize="4xl" fontWeight="bold" textAlign="center" mb={4} color="white">
          About Us
        </Text>
        {/* Mission Statement */}
        <Text fontSize="lg" textAlign="center" mb={4} color="gray.200">
          <b>Our Mission:</b> Empowering communities with affordable solar energy and smart financial management.
        </Text>
        {/* What We Do */}
        <Text fontSize="md" textAlign="center" mb={8} color="gray.300">
          Gridx helps low-income households and small businesses manage energy usage efficiently, track expenses, and stay powered sustainably. We combine technology, finance, and clean energy to create a brighter future for all.
        </Text>
        {/* Core Values */}
        <Box mb={8}>
          <Heading as="h3" size="md" color="white" mb={2} textAlign="center">Our Core Values</Heading>
          <Flex justify="center" wrap="wrap" gap={6}>
            <Box bg="gray.600" borderRadius="md" p={4} minW="150px" textAlign="center" color="white">Sustainability</Box>
            <Box bg="gray.600" borderRadius="md" p={4} minW="150px" textAlign="center" color="white">Community</Box>
            <Box bg="gray.600" borderRadius="md" p={4} minW="150px" textAlign="center" color="white">Innovation</Box>
            <Box bg="gray.600" borderRadius="md" p={4} minW="150px" textAlign="center" color="white">Transparency</Box>
          </Flex>
        </Box>
        {/* Team Streamline */}
        <Text fontSize="3xl" fontWeight="bold" textAlign="center" mb={4} color="white">
          Our Team
        </Text>
        <Flex
          direction="row"
          wrap="wrap"
          justify="center"
          align="flex-start"
          gap={6}
          mb={8}
        >
          {team.map((member) => (
            <Box
              key={member.name}
              bg="gray.700"
              borderRadius="2xl"
              boxShadow="lg"
              p={6}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minW="200px"
              maxW="250px"
              mx="auto"
              mb={4}
              transition="transform 0.2s"
              _hover={{ transform: 'translateY(-6px) scale(1.04)', boxShadow: '2xl' }}
            >
              {/* Full-size square profile picture */}
              <Box
                width="120px"
                height="120px"
                mb={4}
                borderRadius="md"
                overflow="hidden"
                bg="black"
                border="3px solid"
                borderColor="whiteAlpha.400"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </Box>
              <Text fontWeight="bold" color="white" fontSize="lg" mb={1} textAlign="center">
                {member.name}
              </Text>
              <Text color="gray.300" fontSize="sm" textAlign="center">
                {member.role}
              </Text>
            </Box>
          ))}
        </Flex>
        {/* Contact Info & Socials */}
        <Box textAlign="center" mb={6}>
          <Heading as="h3" size="md" color="white" mb={2}>Contact Us</Heading>
          <Text color="gray.200" mb={2}>
            Have questions or feedback? Reach out to us!
          </Text>
          <Flex justify="center" gap={4} mb={2}>
            <Button as="a" href="mailto:support@gridx.com" leftIcon={<FaEnvelope />} colorScheme="blue" variant="ghost" size="sm">
              Email
            </Button>
            <Button as="a" href="https://twitter.com/" leftIcon={<FaTwitter />} colorScheme="twitter" variant="ghost" size="sm" target="_blank">
              Twitter
            </Button>
            <Button as="a" href="https://facebook.com/" leftIcon={<FaFacebook />} colorScheme="facebook" variant="ghost" size="sm" target="_blank">
              Facebook
            </Button>
            <Button as="a" href="https://instagram.com/" leftIcon={<FaInstagram />} colorScheme="pink" variant="ghost" size="sm" target="_blank">
              Instagram
            </Button>
          </Flex>
          <Text color="gray.400" fontSize="xs">
            support@gridx.com
          </Text>
        </Box>
        {/* Legal/Privacy */}
        <Box textAlign="center" mb={4}>
          <Text color="gray.500" fontSize="xs">
            By using Gridx, you agree to our <a href="/privacy" style={{ color: "#63b3ed" }}>Privacy Policy</a> and <a href="/terms" style={{ color: "#63b3ed" }}>Terms of Service</a>.
          </Text>
        </Box>
        {/* Version/Last Updated */}
        <Box textAlign="center" mb={2}>
          <Text color="gray.600" fontSize="xs">
            Version 1.0.0 &nbsp;|&nbsp; Last updated: June 2024
          </Text>
        </Box>
        {/* CTA */}
        <Box textAlign="center" mt={4}>
          <Button colorScheme="teal" size="md" as="a" href="/register">
            Join Gridx Today
          </Button>
        </Box>
        <Box textAlign="center" mt={8}>
          <Button
            as={RouterLink}
            to="/terms-of-service"
            colorScheme="blue"
            variant="outline"
            mr={4}
          >
            Terms of Service
          </Button>
          <Button
            as={RouterLink}
            to="/privacy-policy"
            colorScheme="blue"
            variant="outline"
          >
            Privacy Policy
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default AboutPage;
