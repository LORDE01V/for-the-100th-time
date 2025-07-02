import { Box, Flex, Stack, IconButton, Text, Link as ChakraLink } from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

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
          <ChakraLink href="#" color="white" _hover={{ textDecoration: 'underline' }}>Home</ChakraLink>
          <ChakraLink href="#" color="white" _hover={{ textDecoration: 'underline' }}>About</ChakraLink>
          <ChakraLink href="#" color="white" _hover={{ textDecoration: 'underline' }}>Services</ChakraLink>
          <ChakraLink href="#" color="white" _hover={{ textDecoration: 'underline' }}>Team</ChakraLink>
          <ChakraLink href="#" color="white" _hover={{ textDecoration: 'underline' }}>Contact</ChakraLink>
        </Stack>
      </Flex>
      <Text fontSize="sm">©2021 Nadine Coelho | All Rights Reserved · Powered by GridX</Text>
    </Box>
  );
};

export default Footer; 