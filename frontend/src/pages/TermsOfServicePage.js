import React, { useEffect } from 'react';
import { Box, Heading, Text, VStack, Container, useColorModeValue, IconButton } from '@chakra-ui/react';
import backgroundImage from '../assets/images/Terms_Page_And_Services.png';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function TermsOfServicePage() {
  const navigate = useNavigate();
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.15)');
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(17, 25, 40, 0.85)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const headingColor = useColorModeValue('gray.800', 'white');
  const listColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    console.log('TermsOfServicePage is rendering with styles check');
    console.log('Background image URL being used:', `url(${backgroundImage})`);
  }, []);

  return (
    <Box minH="100vh" position="relative" py={10}>
      <IconButton
        aria-label="Back"
        icon={<FaArrowLeft />}
        size="sm"
        position="absolute"
        top="1rem"
        left="1rem"
        onClick={() => navigate(-1)}
        zIndex="3"
      />
      {/* Background image with overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        backgroundImage={`url(${backgroundImage})`}
        backgroundPosition="center"
        backgroundSize="cover"
        backgroundRepeat="no-repeat"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: overlayBg,
          backdropFilter: 'blur(2px)',
        }}
      />
      
      <Container 
        maxW="3xl" 
        position="relative"
        zIndex="2"
        bg={glassBg}
        backdropFilter="blur(12px) saturate(160%)"
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.18)"
        p={8}
        sx={{
          WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        }}
      >
        <Heading as="h2" size="xl" mb={6} textAlign="center" color={headingColor}>
          Terms of Service for Gridx
        </Heading>
        <Text color={textColor} mb={4}>Effective Date: [Insert Date]</Text>
        <VStack align="start" spacing={6} color={textColor}>
          <Text>
            Welcome to Gridx! These Terms of Service (“Terms”) govern your use of our web app. By accessing or using Gridx, you agree to these Terms.
          </Text>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>1. Your Gridx Account</Heading>
            <Text>
              You must be at least 13 years old to create an account.<br />
              You are responsible for keeping your login credentials secure.<br />
              You agree to provide accurate and complete information during registration.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>2. User Responsibilities</Heading>
            <Text mb={2}>You agree not to:</Text>
            <Box as="ul" pl={6} color={listColor}>
              <li>Use Gridx for unlawful, harmful, or abusive activities.</li>
              <li>Upload or share offensive, misleading, or malicious content.</li>
              <li>Attempt to hack, exploit, or disrupt Gridx or its users.</li>
              <li>Violate any applicable laws or regulations.</li>
            </Box>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>3. Data and Content</Heading>
            <Text>
              You retain ownership of the data you submit (e.g., usage, expenses).<br />
              By using community features, you give us permission to display your shared content within the platform.<br />
              We may anonymize data to improve services and insights.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>4. Service Availability</Heading>
            <Text>
              We aim to provide uninterrupted service but cannot guarantee 100% uptime.<br />
              We may modify, update, or suspend parts of the app at any time with notice where possible.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>5. Termination</Heading>
            <Text>
              You can delete your account at any time.<br />
              We may suspend or terminate your access if you violate these Terms or engage in harmful behavior.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>6. Intellectual Property</Heading>
            <Text>
              Gridx and all related designs, logos, and code are the property of [Your Company Name].<br />
              You may not copy, reproduce, or reverse-engineer any part of Gridx without permission.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>7. Limitation of Liability</Heading>
            <Text mb={2}>We are not liable for:</Text>
            <Box as="ul" pl={6} color={listColor}>
              <li>Any damages resulting from your use or inability to use the platform.</li>
              <li>Loss of data, profits, or reputation.</li>
              <li>Third-party content or links accessed through Gridx.</li>
            </Box>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>8. Changes to These Terms</Heading>
            <Text>
              We may update these Terms from time to time. If we do, we'll notify you via the app or email. Continued use means you agree to the new terms.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>9. Contact Information</Heading>
            <Text>
              If you have any questions or need assistance, please contact us at [Your Company Email] or [Your Company Phone Number].
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default TermsOfServicePage;