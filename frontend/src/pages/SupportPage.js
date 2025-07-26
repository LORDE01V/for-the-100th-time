/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

// Import Chakra UI Components
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  useToast,
  Spinner,
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Link as ChakraLink,
  Icon,
  HStack
} from '@chakra-ui/react';

// Import Icons
import { FaArrowLeft, FaPhone, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import supportBackground from '../assets/images/Support_page.png';

function SupportPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = auth.getCurrentUser();

  // State for contact form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Move useColorModeValue calls to the top level
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const linkColor = useColorModeValue('blue.500', 'blue.300');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const faqBoxBg = useColorModeValue('white', 'rgba(0, 0, 0, 0.6)');
  const faqBoxBorderColor = useColorModeValue('gray.200', 'gray.600');
  const contactBoxBg = useColorModeValue('white', 'rgba(0, 0, 0, 0.6)');
  const contactBoxBorderColor = useColorModeValue('gray.200', 'gray.600');

  // Dummy FAQ data
  const faqItems = [
    {
      question: 'How do I top up my solar energy credit?',
      answer: 'You can top up your energy credit on the Top-Up page. Select your preferred amount or enter a voucher code and follow the payment instructions.'
    },
    {
      question: 'How can I track my energy usage?',
      answer: 'Your energy usage and analytics can be viewed on the Dashboard page, which provides daily, weekly, and monthly summaries.'
    },
    {
      question: 'What should I do if my solar system is not generating power?',
      answer: 'First, check the System Status page for any alerts. If the issue persists, please contact our support team using the form below or the contact details provided.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'You can update your personal details, such as phone number and address, on the Profile page.'
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/');
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, navigate, toast]);

  const handleBackClick = () => {
    navigate('/home');
  };

  // ... existing code ...
const handleContactSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const response = await fetch('https://backend-7oa8.onrender.com/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message }),
    });
    const data = await response.json();
    if (response.ok) {
      toast({
        title: 'Message Sent',
        description: 'Your support request has been received. We will contact you shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } else {
      toast({
        title: 'Error',
        description: data.error || 'Failed to send message.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  } catch (err) {
    toast({
      title: 'Error',
      description: 'Failed to send message.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }
  setIsSubmitting(false);
};
// ... existing code ...

  const filteredFaqItems = faqItems.filter(item => item.question !== 'How do I update my profile information?');

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" color={spinnerColor} />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      width="100vw"
      backgroundImage={`url(${supportBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
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
          onClick={handleBackClick}
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          Back
        </Button>

        <Heading as="h1" size="xl" color={headingColor} mb={6}>
          Support and Help Center
        </Heading>

        {/* FAQ Section */}
        <Box
          p={6}
          bg={faqBoxBg}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={faqBoxBorderColor}
          boxShadow="xl"
          borderRadius="xl"
          mb={8}
          color={headingColor}  // Use for text inside
        >
          <Heading as="h2" size="lg" mb={4} color={headingColor}>
            Frequently Asked Questions
          </Heading>
          <Accordion allowMultiple>
            {filteredFaqItems.map((item, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="semibold" color={textColor}>
                      {item.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} color={textColor}>
                  {item.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        {/* Contact Form Section */}
        <Box
          p={6}
          bg={contactBoxBg}  // Reuse or define a new one if needed
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={contactBoxBorderColor}
          boxShadow="xl"
          borderRadius="xl"
          mb={8}
          color={headingColor}
        >
          <Heading as="h2" size="lg" mb={4} color={headingColor}>
            Contact Support
          </Heading>
          <Text color={textColor} mb={4}>
            Could not find your answer? Send us a message.
          </Text>
          <VStack as="form" spacing={4} onSubmit={handleContactSubmit}>
            <FormControl id="contact-name" isRequired>
              <FormLabel color={textColor}>Your Name</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderColor={inputBorderColor}
                _hover={{ borderColor: 'teal.500' }}
                _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
              />
            </FormControl>
            <FormControl id="contact-email" isRequired>
              <FormLabel color={textColor}>Email Address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                borderColor={inputBorderColor}
                _hover={{ borderColor: 'teal.500' }}
                _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
              />
            </FormControl>
            <FormControl id="contact-subject">
              <FormLabel color={textColor}>Subject</FormLabel>
              <Input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                borderColor={inputBorderColor}
                _hover={{ borderColor: 'teal.500' }}
                _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
              />
            </FormControl>
            <FormControl id="contact-message" isRequired>
              <FormLabel color={textColor}>Message</FormLabel>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                borderColor={inputBorderColor}
                _hover={{ borderColor: 'teal.500' }}
                _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              fontSize="md"
              isLoading={isSubmitting}
              loadingText="Sending..."
              w="full"
              mt={4}
            >
              Send Message
            </Button>
          </VStack>
        </Box>
        {/* Add other sections as needed */}
      </Container>
    </Box>
  );
}

export default SupportPage;  // Ensure the file exports the component
