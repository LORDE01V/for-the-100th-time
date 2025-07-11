/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service is still used
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// Removed unused imports: ReactSlick and ReactCalendar
// eslint-disable-next-line no-unused-vars
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Calendar from 'react-calendar';
import api from '../services/api';
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
  IconButton,
  Input,
  VStack
} from '@chakra-ui/react';
import { FaSolarPanel, FaUsers, FaLeaf, FaArrowLeft, FaDownload, FaStar } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import { motion } from 'framer-motion';
import './ImpactPage.css';  // Assuming we'll create a new CSS file for print styles, or add inline if needed
import EventCalendar from '../components/EventCalendar';  // New import for the calendar component
import ImpactMapPreview from '../components/ImpactMapPreview';
import impactBackground from '../assets/images/page_impact.png';

function generateImpactReportPDF() {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Gridx Impact Report", 20, 20);

  doc.setFontSize(12);
  doc.text("Total Solar Energy Provided: 1.2M kWh saved", 20, 40);
  doc.text("Households Served: 4,300+ families empowered", 20, 50);
  doc.text("CO₂ Emissions Reduced: 620 tons offset", 20, 60);

  doc.save("impact_report.pdf");
}

function ImpactPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = auth.getCurrentUser();
  const [quote, setQuote] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [testimonials, setTestimonials] = useState(() => {
    // Ignore localStorage for now to always show the new profiles
    return [
      { name: 'Emily Johnson', quote: 'GridX made solar simple for my family!', avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167', rating: 5 },
      { name: 'Michael Smith', quote: 'Fantastic support and easy to use.', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91', rating: 4 },
      { name: 'Jessica Brown', quote: 'I love tracking my energy savings.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', rating: 5 },
      { name: 'David Wilson', quote: 'Solar energy has never been easier.', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e', rating: 5 },
      { name: 'Ashley Miller', quote: 'GridX is a game changer for my home.', avatar: 'https://images.unsplash.com/photo-1464983953574-0892a716854b', rating: 4 },
      { name: 'Matthew Davis', quote: 'Highly recommend to anyone going solar.', avatar: 'https://images.unsplash.com/photo-1519340333755-c2f6c58f5c4b', rating: 5 },
      { name: 'Hannah Moore', quote: 'Easy to use and very informative.', avatar: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', rating: 4 },
      { name: 'Christopher Taylor', quote: 'Great for monitoring my energy use.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', rating: 5 },
      { name: 'Lauren Anderson', quote: 'The best app for solar households.', avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167', rating: 5 },
      { name: 'Daniel Thomas', quote: 'I appreciate the detailed analytics.', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91', rating: 4 },
      { name: 'Olivia Jackson', quote: 'My bills have dropped thanks to Gridx.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', rating: 5 },
      { name: 'James White', quote: 'Setup was quick and painless.', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e', rating: 5 },
      { name: 'Samantha Harris', quote: 'I love seeing my energy impact.', avatar: 'https://images.unsplash.com/photo-1464983953574-0892a716854b', rating: 4 },
      { name: 'Benjamin Martin', quote: 'GridX is the future of home energy.', avatar: 'https://images.unsplash.com/photo-1519340333755-c2f6c58f5c4b', rating: 5 },
      { name: 'Grace Lee', quote: 'So easy, even my kids use it!', avatar: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', rating: 5 }
    ];
  });

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !quote) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
 
    
    const newTestimonial = {
      name,
      quote,
      email,
      rating,
      avatar: 'https://via.placeholder.com/150',
    };
    
    try {
      const response = await api.post('/api/stories', { username: name, email, story: quote });
      if (response.data.success) {
        toast({
          title: 'Story Submitted',
          description: 'Your story has been saved successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setName('');
        setEmail('');
        setQuote('');
        setRating(0); // Reset rating if needed
      } else {
        throw new Error(response.data.message);
      }
       
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit your story. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Submission error:', error);
    }
    
    setName('');
    setEmail('');
    setQuote('');
    setRating(0);
  };

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const statColor = useColorModeValue('teal.500', 'teal.300');
  const testimonialBorderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'whiteAlpha.700');

  const MotionIcon = motion(Icon);

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

  useEffect(() => {
    console.log('Number of testimonials:', testimonials.length);
  }, [testimonials]);

  const impactStats = [
    { label: 'Total Solar Energy Provided', value: '1.2M kWh saved', icon: FaSolarPanel },
    { label: 'Households Served', value: '4,300+ families empowered', icon: FaUsers },
    { label: 'CO₂ Emissions Reduced', value: '620 tons offset', icon: FaLeaf },
  ];

  function handleRate(testimonialIndex, newRating) {
    const updatedTestimonials = [...testimonials];
    updatedTestimonials[testimonialIndex].rating = newRating;
    setTestimonials(updatedTestimonials);
    localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials));
  }

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
      width="100vw"
      backgroundImage={`url(${impactBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
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
          <Button
            onClick={() => window.print()}
            colorScheme="teal"
            leftIcon={<FaDownload />}
          >
            Print Page
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
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255, 255, 255, 0.2)"
                  boxShadow="md"
                  borderRadius="lg"
                  borderColor={testimonialBorderColor}
                  borderWidth="1px"
                >
                  <Flex align="center" mb={2}>
                    <Icon as={stat.icon} w={8} h={8} color={statColor} mr={3} />
                    <Stat>
                      <StatLabel fontSize="md">{stat.label}</StatLabel>
                      <StatNumber>{stat.value}</StatNumber>
                    </Stat>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Divider />

          <Box bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.2)">
            <Heading as="h2" size="lg" mb={4}>Upcoming Events Calendar</Heading>
            <EventCalendar />
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
              autoplay={true}
              autoplaySpeed={3000}
              accessibility={true}
            >
              {testimonials.map((testimonial, index) => (
                <Box key={testimonial.name} p={6} bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.2)" borderWidth="1px" borderColor={testimonialBorderColor} borderRadius="lg" boxShadow="md">
                  <Flex align="center" mb={4}>
                    <Avatar src={testimonial.avatar} name={testimonial.name} size="xl" mr={4} />
                    <VStack align="start" flex="1">
                      <Text fontSize="lg" fontStyle="italic" color={textColor}>"{testimonial.quote}"</Text>
                      <HStack mt={2}>
                        {Array(5).fill('').map((_, starIndex) => (
                          <MotionIcon
                            as={FaStar}
                            key={starIndex}
                            color={starIndex < testimonial.rating ? 'yellow.400' : 'gray.300'}
                            boxSize={6}
                            onClick={() => handleRate(index, starIndex + 1)}
                            cursor="pointer"
                            initial={{ scale: 1 }}
                            animate={testimonial.rating === 5 && starIndex === 4 ? { scale: [1, 1.5, 1], rotate: [0, 360, 0], transition: { duration: 0.5 } } : { scale: 1 }}
                          />
                        ))}
                      </HStack>
                      <Text fontWeight="bold" fontSize="md" color={subTextColor}>{testimonial.name}</Text>
                    </VStack>
                  </Flex>
                </Box>
              ))}
            </Slider>
          </Box>

          <Divider />

          <Box>
            <Heading as="h2" size="lg" mb={4}>Upcoming Events Calendar</Heading>
            <EventCalendar />
          </Box>

          <Divider />

          <Box textAlign="center">
            <Heading as="h2" size="lg" mb={4}>Why Solar + Fintech Matters</Heading>
            <Text fontSize="lg" maxWidth="800px" mx="auto">
              Access to clean, affordable energy is transformative. By combining solar technology with accessible fintech solutions, we empower individuals and communities, drive economic growth, and build a sustainable future. Every watt saved and every household powered contributes to a brighter tomorrow.
            </Text>
          </Box>

          <Divider my={8} />

          <Box bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" border="1px solid rgba(255, 255, 255, 0.2)">
            <Heading as="h2" size="lg" mb={4}>Communities We've Reached</Heading>
            <ImpactMapPreview />
          </Box>
        </Stack>
      </Box>

      <Box
        position="fixed"
        bottom="90px"
        right="24px"
        zIndex="9999"
      >
        <IconButton
          aria-label="Download Impact Report"
          icon={<FaDownload />}
          size="lg"
          colorScheme="teal"
          isRound
          boxShadow="lg"
          onClick={() => {
            generateImpactReportPDF();
            toast({
              title: 'Report downloaded',
              description: 'Your impact report has been downloaded successfully.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }}
        />
      </Box>
    </Box>
  );
}

export default ImpactPage; 