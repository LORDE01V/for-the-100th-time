import { Box, Flex, Stack, IconButton, Text, Link as ChakraLink, Button } from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaArrowUp } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      bg="linear-gradient(90deg, #1c65d1, #2d8dee)"
      py={6}
      color="white"
      textAlign="center"
    >
      <Flex justify="center" mb={4}>
        <Stack direction="row" spacing={4}>
          <IconButton
            as="a"
            href="https://facebook.com"
            icon={<FaFacebook />}
            aria-label="Facebook"
          />
          <IconButton
            as="a"
            href="https://twitter.com"
            icon={<FaTwitter />}
            aria-label="Twitter"
          />
          <IconButton
            as="a"
            href="https://linkedin.com"
            icon={<FaLinkedin />}
            aria-label="LinkedIn"
          />
          <IconButton
            as="a"
            href="https://instagram.com"
            icon={<FaInstagram />}
            aria-label="Instagram"
          />
        </Stack>
      </Flex>
      <Flex justify="center" mb={4}>
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <ChakraLink as={RouterLink} to="/about" color="white" _hover={{ textDecoration: 'underline' }}>About</ChakraLink>
          <ChakraLink as={RouterLink} to="/" color="white" _hover={{ textDecoration: 'underline' }}>Home</ChakraLink>
          <ChakraLink as={RouterLink} to="/subscription" color="white" _hover={{ textDecoration: 'underline' }}>Services</ChakraLink>
          <ChakraLink as={RouterLink} to="/team" color="white" _hover={{ textDecoration: 'underline' }}>Team</ChakraLink>
          <ChakraLink as={RouterLink} to="/support" color="white" _hover={{ textDecoration: 'underline' }}>Contact</ChakraLink>
        </Stack>
      </Flex>
      <Text fontSize="sm" mb={2} color="white" textShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">©2025 | All Rights Reserved · Powered by GridX</Text>
      <Text fontSize="xs" mb={4} color="white" textShadow="1px 1px 2px rgba(0, 0, 0, 0.5)">Innovating Energy Solutions for a Sustainable Tomorrow</Text>
      <Button
        size="sm"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        rightIcon={<FaArrowUp />}
        variant="outline"
        colorScheme="whiteAlpha"
      >
        Back to Top
      </Button>
    </Box>
  );
};

export default Footer; 