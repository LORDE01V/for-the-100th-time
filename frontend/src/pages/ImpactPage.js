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
  IconButton
} from '@chakra-ui/react';
import { FaSolarPanel, FaUsers, FaLeaf, FaArrowLeft, FaDownload } from 'react-icons/fa';
import { jsPDF } from "jspdf";

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
    const savedTestimonials = localStorage.getItem('testimonials');
    return savedTestimonials ? JSON.parse(savedTestimonials) : [
      { name: 'Sarah M.', quote: 'This app has made managing my solar energy so easy!', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956' },
      { name: 'John D.', quote: 'Empowering my community through clean energy!', avatar: 'https://images.unsplash.com/photo-1544005313-94cdfd42a3b9' }
    ];
  });

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast({ title: 'Error', description: 'Name is required.', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    if (!email || !isValidEmail(email)) {
      toast({ title: 'Error', description: 'A valid Email is required.', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    if (!quote) {
      toast({ title: 'Error', description: 'Testimonial is required.', status: 'error', duration: 3000, isClosable: true });
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
      const updatedTestimonials = [...testimonials, newTestimonial];
      setTestimonials(updatedTestimonials);
      localStorage.setItem('testimonials', JSON.stringify(updatedTestimonials));
      toast({ title: 'Story Submitted', description: 'Your story has been simulated successfully! (Not yet saved to database)', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: 'Error', description: 'Submission failed. Please try again later.', status: 'error', duration: 3000, isClosable: true });
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
                      <StatNumber>{stat.value}</StatNumber>
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
            <Button onClick={handleSubmit} colorScheme="teal">Share Your Story</Button>
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