import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service is still used
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Spinner,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Avatar,
  Stack,
  Icon,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import { FaSolarPanel, FaUsers, FaLeaf, FaArrowLeft } from 'react-icons/fa';

function ImpactPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = auth.getCurrentUser();
  const [isOpen, setIsOpen] = useState(false);  // Define state for modal

  const onOpen = () => setIsOpen(true);  // Define onOpen function
  const onClose = () => setIsOpen(false);  // Define onClose function

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const statColor = useColorModeValue('teal.500', 'teal.300');
  const testimonialBg = useColorModeValue('white', 'gray.800');
  const testimonialBorderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      toast({
        title: 'Authentication required.',
        description: "Please log in to view the impact.",
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, navigate, toast]);

  const impactStats = [
    { label: 'Total Solar Energy Provided', value: '1.2M kWh saved', icon: FaSolarPanel },
    { label: 'Households Served', value: '4,300+ families empowered', icon: FaUsers },
    { label: 'CO₂ Emissions Reduced', value: '620 tons offset', icon: FaLeaf },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      quote: 'This app has made managing my solar energy so easy! I can see my impact and top up credits effortlessly.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1361&q=80',
    },
    {
      name: 'John D.',
      quote: 'Empowering my community through clean energy has never been more accessible. Great initiative!',
      avatar: 'https://images.unsplash.com/photo-1544005313-94cdfd42a3b9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1361&q=80',
    },
    // Add more testimonials here
  ];

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" color={statColor} />
      </Flex>
    );
  }

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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      }}
    >
      <Box p={[4, 6, 8]} maxWidth="1200px" mx="auto" color={textColor} position="relative" zIndex={2}>
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

        <Heading as="h1" size="xl" color={headingColor} mb={6}>
          Environmental Impact
        </Heading>

        <Stack spacing={10}>
          <Box>
            <Heading as="h2" size="lg" mb={4}>Impact Statistics</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {impactStats.map((stat, index) => (
                <Box
                  key={index}
                  p={6}
                  boxShadow="md"
                  borderRadius="lg"
                  bg={testimonialBg}
                  borderColor={testimonialBorderColor}
                  borderWidth="1px"
                >
                  <Flex align="center" mb={2}>
                    <Icon as={stat.icon} w={8} h={8} color={statColor} mr={3} />
                    <Stat>
                      <StatLabel fontSize="md">{stat.label}</StatLabel>
                      <StatNumber fontSize="2xl" fontWeight="bold">{stat.value}</StatNumber>
                    </Stat>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Divider />

          <Box>
            <Heading as="h2" size="lg" mb={4}>Community Voices</Heading>
            <Slider
              dots={true}
              infinite={true}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              adaptiveHeight={true}
              responsive={[
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                }
              ]}
              arrows={true}
              accessibility={true}
            >
              {testimonials.map((testimonial, index) => (
                <Box key={index} p={6} boxShadow="md" borderRadius="lg" bg={testimonialBg} borderColor={testimonialBorderColor} borderWidth="1px">
                  <Flex>
                    <Avatar name={testimonial.name} src={testimonial.avatar} mr={4} />
                    <Stack spacing={3}>
                      <Text fontStyle="italic">"{testimonial.quote}"</Text>
                      <Text fontWeight="bold">- {testimonial.name}</Text>
                    </Stack>
                  </Flex>
                </Box>
              ))}
            </Slider>
          </Box>

          <Divider />

          <Box textAlign="center">
            <Heading as="h2" size="lg" mb={4}>Why Solar + Fintech Matters</Heading>
            <Text fontSize="lg" maxWidth="800px" mx="auto">
              Access to clean, affordable energy is transformative. By combining solar technology with accessible fintech solutions, we empower individuals and communities, drive economic growth, and build a sustainable future. Every watt saved and every household powered contributes to a brighter tomorrow.
            </Text>
          </Box>

          <Box textAlign="center" mt={10}>
            <Button onClick={onOpen} colorScheme="teal">Share Your Story</Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Share Your Story</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Stack spacing={4}>
                    <FormControl>
                      <FormLabel>Quote</FormLabel>
                      <Input placeholder="Share your experience..." />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input placeholder="Your name..." />
                    </FormControl>
                  </Stack>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button colorScheme="teal" ml={3} onClick={() => { /* Handle form submission logic here */ }}>Submit</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default ImpactPage; 