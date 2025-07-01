import React, { useEffect } from 'react';
import { Box, Heading, Text, VStack, UnorderedList, ListItem, Container, useColorModeValue } from '@chakra-ui/react';
import backgroundImage from '../assets/images/Terms_Page_And_Services.png';

console.log('Imported background image:', backgroundImage);  // Debug log for image

function PrivacyPolicyPage() {
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.15)');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const headingColor = useColorModeValue('gray.800', 'white');
  const listColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    console.log('PrivacyPolicyPage is rendering with styles check');
  }, []);

  return (
    <Box position="relative" minH="100vh" py={10}>
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        backgroundImage={`url(${backgroundImage})`}
        backgroundSize="cover"
        backgroundPosition="center"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: overlayBg,
          backdropFilter: 'blur(2px)'
        }}
      />
      <Container 
        maxW="3xl" 
        position="relative"
        zIndex="2"
        bg={useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(17, 25, 40, 0.85)')}
        backdropFilter="blur(10px)"
        borderRadius="lg"
        boxShadow="md"
        p={8}
        sx={{
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <Heading as="h2" size="xl" mb={6} textAlign="center" color={headingColor}>
          Privacy Policy for Gridx
        </Heading>
        <Text color={textColor} mb={4}>Effective Date: [Insert Date]</Text>
        <VStack align="start" spacing={6} color={textColor}>
          <Text>
            Welcome to Gridx! Your privacy is important to us, and this policy explains how we collect, use, and protect your information when you use our web application.
          </Text>
          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>1. What Information We Collect</Heading>
            <Text>
              <b>Personal Information:</b> Name, email address, phone number, and other registration details.<br />
              <b>Usage Data:</b> Solar energy usage statistics, financial/expense tracking inputs, and feature interactions.<br />
              <b>Device & Technical Info:</b> IP address, browser type, device type, and cookies.<br />
              <b>Community Data (if applicable):</b> Profile photo, shared posts, and messages within community features.
            </Text>
          </Box>
          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>2. Why We Collect Your Data</Heading>
            <Text>We collect data to:</Text>
            <UnorderedList spacing={3} pl={5} color={listColor}>
              <ListItem>Provide and improve your experience on Gridx.</ListItem>
              <ListItem>Track solar usage and financial data to generate insights.</ListItem>
              <ListItem>Customize content and recommendations.</ListItem>
              <ListItem>Communicate with you (emails, alerts, reminders).</ListItem>
              <ListItem>Ensure security and detect misuse.</ListItem>
            </UnorderedList>
          </Box>
          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>3. How We Store and Protect Your Data</Heading>
            <Text>
              We use secure servers and encryption to protect your personal data.<br />
              Your information is stored on secure databases and cloud infrastructure.<br />
              Access is restricted to authorized personnel only.<br />
              We regularly update our systems for security.
            </Text>
          </Box>
          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>4. Cookies and Analytics</Heading>
            <Text>
              We use cookies to personalize your experience and remember your preferences.<br />
              We may use third-party analytics (e.g., Google Analytics) to understand usage trends.<br />
              You can disable cookies in your browser, but some features may not work properly.
            </Text>
          </Box>
          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>5. Sharing Your Information</Heading>
            <Text>We do not sell or share your personal data with third parties, except:</Text>
            <UnorderedList spacing={3} pl={5} color={listColor}>
              <ListItem>With your consent.</ListItem>
              <ListItem>With trusted vendors (e.g., email providers) who help us operate Gridx.</ListItem>
              <ListItem>When required by law or to protect rights/safety.</ListItem>
            </UnorderedList>
          </Box>
          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>6. Your Rights and Choices</Heading>
            <Text>You have the right to:</Text>
            <UnorderedList spacing={3} pl={5} color={listColor}>
              <ListItem>Access your personal data.</ListItem>
              <ListItem>Correct or update your information.</ListItem>
              <ListItem>Request deletion of your account and associated data.</ListItem>
              <ListItem>Opt-out of marketing communications at any time.</ListItem>
            </UnorderedList>
            <Text>To do any of the above, contact us at [Insert Contact Email].</Text>
          </Box>
          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>7. Children's Privacy</Heading>
            <Text>
              Gridx is not intended for children under 13. We do not knowingly collect personal information from children.
            </Text>
          </Box>
          <Box>
            <Heading as="h3" size="md" mb={2} color={headingColor}>8. Contact Us</Heading>
            <Text>
              If you have any questions or concerns about your privacy, please reach out to:<br />
              📧 Email: [Insert Privacy Contact Email]<br />
              📍 Address (optional): [Insert Company Address]
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default PrivacyPolicyPage;
