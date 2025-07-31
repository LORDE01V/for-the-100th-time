

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Progress,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  useColorModeValue,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Image,
  Flex,
  Icon,
  Switch,
  Tooltip,
  Select,
  Avatar,
} from '@chakra-ui/react';
import { FaUsers, FaClock, FaTag, FaSolarPanel, FaBolt, FaBatteryFull, FaArrowLeft } from 'react-icons/fa';
import { FiShare2 } from 'react-icons/fi';  // Separate import for FiShare2
import { useNavigate } from 'react-router-dom';
import batteryBankImage from '../assets/images/battery_bank_10_kwh.png';
import inverterImage from '../assets/images/inverter__5kw_hybrid.png';
import solarPanelImage from '../assets/images/solar_panel_350w.png';
import groupBuyingBackground from '../assets/images/group_buying.png';  // Import the background image
import { motion, AnimatePresence } from 'framer-motion';
import rctImage from '../assets/images/rct.jpeg';
import newSolarPanelImage from '../assets/images/solar_panel.png';
import { Gi3dGlasses } from 'react-icons/gi';
import inverterGeneratorImage from '../assets/images/Inverter_power_generator.jpg';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

// Create a motion component for Text
const MotionText = motion.create(Text);

// Change this line:
// const MotionBox = motion.create(Box);

function GroupBuying() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  // Mock data for solar gear campaigns - No placeholder images
  const [ongoingCampaigns, setOngoingCampaigns] = useState(useMemo(() => [
    {
      id: 1,
      product: 'Solar Panel (350W)',
      image: solarPanelImage,
      originalPrice: 2000,
      groupPrice: 1500,
      goal: 20,
      participants: 12,
      deadline: '2024-04-30',
      description: 'High-efficiency monocrystalline solar panels perfect for residential installations.',
      timeLeft: '15 days left',
      category: 'Solar Panels',
      icon: FaSolarPanel,
      milestones: [
        { price: 1800, participants: 15 },
        { price: 1600, participants: 20 },
        { price: 1400, participants: 25 },
      ]
    },
    {
      id: 2,
      product: 'Inverter (5kW Hybrid)',
      image: inverterImage,
      originalPrice: 22000,
      groupPrice: 18000,
      goal: 10,
      participants: 8,
      deadline: '2024-05-15',
      description: 'Smart hybrid inverter with battery backup and grid-tie capabilities.',
      timeLeft: '30 days left',
      category: 'Inverters',
      icon: FaBolt,
      milestones: [
        { price: 20000, participants: 5 },
        { price: 19000, participants: 7 },
        { price: 18000, participants: 10 },
      ]
    },
    {
      id: 3,
      product: 'Battery Bank (10kWh)',
      image: batteryBankImage, // Updated to use the imported image
      originalPrice: 55000,
      groupPrice: 45000,
      goal: 5,
      participants: 3,
      deadline: '2024-05-01',
      description: 'Lithium-ion battery bank for reliable energy storage.',
      timeLeft: '16 days left',
      category: 'Batteries',
      icon: FaBatteryFull,
      milestones: [
        { price: 50000, participants: 3 },
        { price: 48000, participants: 4 },
        { price: 46000, participants: 5 },
      ]
    },
    // New campaigns added below
    {
      id: 4,
      product: 'Solar Panel (450W Premium)',
      image: newSolarPanelImage,
      originalPrice: 2500,
      groupPrice: 1800,
      goal: 25,
      participants: 15,
      deadline: '2024-05-25',
      description: 'Advanced monocrystalline panels with 22% efficiency rating',
      timeLeft: '20 days left',
      category: 'Solar Panels',
      icon: FaSolarPanel,
      milestones: [
        { price: 2200, participants: 18 },
        { price: 2000, participants: 22 },
        { price: 1800, participants: 25 },
      ]
    },
    {
      id: 5,
      product: 'RCT Power Device',
      image: rctImage,
      originalPrice: 8500,
      groupPrice: 6500,
      goal: 15,
      participants: 7,
      deadline: '2024-05-10',
      description: 'Smart energy management device for optimal power distribution',
      timeLeft: '10 days left',
      category: 'Devices',
      icon: FaBolt,
      milestones: [
        { price: 7500, participants: 10 },
        { price: 7000, participants: 12 },
        { price: 6500, participants: 15 },
      ]
    },
    {
      id: 6,
      product: 'Inverter Power Generator (8kW)',
      image: inverterGeneratorImage,
      originalPrice: 35000,
      groupPrice: 29500,
      goal: 15,
      participants: 7,
      deadline: '2024-06-15',
      description: 'Dual fuel inverter generator with smart throttle technology for optimal fuel efficiency',
      timeLeft: '45 days left',
      category: 'Generators',
      icon: FaBolt,
      milestones: [
        { price: 32000, participants: 10 },
        { price: 31000, participants: 12 },
        { price: 30000, participants: 15 },
      ]
    }
  ], []));

  const [newCampaign, setNewCampaign] = useState({
    product: '',
    description: '',
    originalPrice: 0,
    groupPrice: 0,
    targetBuyers: 10,
    deadline: '',
    image: null,
    category: 'Solar Panels', // Default category
    notifyMe: false, // Added for notification preference
  });

  const [monthlyUsage] = useState(500);
  const [showNotificationPref, setShowNotificationPref] = useState(false);
  const [referralCode] = useState(`REF-${Math.random().toString(36).slice(2, 7).toUpperCase()}`);

  // Array of motivational lines
  const motivationalLines = useMemo(() => [
    "Unlock exclusive savings by joining forces with other buyers!",
    "Group buying: the smart way to go solar and save big!",
    "Lower your costs, increase your impact – together we power change.",
    "Get premium solar gear at unbeatable group prices.",
    "Join a campaign and step closer to energy independence.",
    "Your next energy upgrade is more affordable with group power.",
    "Connect with fellow solar enthusiasts and save together.",
    "Every participant helps drive down the price for everyone.",
    "Don't miss out on limited-time group buying opportunities.",
    "Investing in solar is easier and cheaper in a group.",
  ], []);

  // State for current line index and the key for AnimatePresence
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0); // Key to trigger exit/enter animation

  const testimonials = useMemo(() => [
    { name: "Lihle M.", savings: "R12,400", text: "Joined a battery campaign and saved enough to power my entire home!", rating: 5, location: "Johannesburg", avatar: "https://via.placeholder.com/50", installationPhoto: null },
    { name: "Kgosi T.", savings: "R8,200", text: "The group buying process was smooth and the support team helped with all my questions.", rating: 4.5, location: "Pretoria", avatar: "https://via.placeholder.com/50", installationPhoto: null },
    { name: "Zanele S.", savings: "R5,600", text: "Never thought solar could be this affordable until I found these group deals.", rating: 5, location: "Cape Town", avatar: "https://via.placeholder.com/50", installationPhoto: null }
  ], []);

  // Effect to rotate lines every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLineIndex((prevIndex) =>
        prevIndex === motivationalLines.length - 1 ? 0 : prevIndex + 1
      );
      setAnimationKey(prevKey => prevKey + 1); // Update key to trigger re-render and animation
    }, 7000);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [motivationalLines.length]); // Re-run if the number of lines changes

  // Animation variants for fade in/out
  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Color mode values
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');

  // Define colors for glassmorphism effect on cards
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(0, 0, 0, 0.6)');
  const cardColor = useColorModeValue('gray.800', 'white'); // ... existing code ... 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign({
      ...newCampaign,
      [name]: value,
    });
  };

  const handleNumberInputChange = (name, valueString) => {
    const value = parseFloat(valueString);
    setNewCampaign({
      ...newCampaign,
      [name]: isNaN(value) ? 0 : value,
    });
  };

  const handleJoinCampaign = async (campaignId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'You are not logged in.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const response = await fetch('https://backend-0igj.onrender.com/campaigns/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ campaign_id: campaignId }),
      });
  
      if (response.ok) {
        setOngoingCampaigns(ongoingCampaigns.map(campaign =>
          campaign.id === campaignId ? { ...campaign, participants: campaign.participants + 1 } : campaign
        ));
        toast({
          title: 'Joined Campaign!',
          description: 'You have successfully joined the group buying campaign.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Failed to Join Campaign',
          description: errorData.error || 'An error occurred.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error joining campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to the server.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    console.log('Creating new campaign:', newCampaign);

    // Adjusted validation to check if image is null or empty string
    if (!newCampaign.product || newCampaign.targetBuyers <= 0 || newCampaign.originalPrice <= 0 || !newCampaign.deadline || !newCampaign.image) {
        toast({
            title: 'Creation failed.',
            description: 'Please fill in all campaign details correctly, including image.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
        return;
    }

    const newCampaignWithMockData = {
      ...newCampaign,
      id: ongoingCampaigns.length + 1,
      participants: 0,
      timeLeft: 'Just started!', // Mock value for new campaign
      icon: FaSolarPanel // Default icon, could be dynamic based on category
    };
    setOngoingCampaigns([...ongoingCampaigns, newCampaignWithMockData]);

    toast({
      title: 'Campaign Created!',
      description: `${newCampaign.product} campaign has been created.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    setNewCampaign({
      product: '',
      description: '',
      originalPrice: 0,
      groupPrice: 0,
      targetBuyers: 10,
      deadline: '',
      image: null,
      category: 'Solar Panels',
      notifyMe: false, // Reset notification preference
    });
    setSelectedImage(null);
    onClose(); // Close the modal after creation
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setNewCampaign({
          ...newCampaign,
          image: reader.result, // Store image as base64 or URL
        });
      };
      reader.readAsDataURL(file); // Read file as data URL for preview
    }
  };

  // Add state for AR modal at top of component
  const [selectedARModel, setSelectedARModel] = useState(null);
  const { isOpen: isAROpen, onOpen: onAROpen, onClose: onARClose } = useDisclosure();

  // Add Transparency Dashboard component
  const TrustPanel = ({ supplierRating, deliverySuccess, disputeResolution }) => (
    <SimpleGrid columns={3} spacing={4} mb={8} p={4} 
      bg={useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(0, 0, 0, 0.4)')}
      borderRadius="lg" backdropFilter="blur(10px)" borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.600')}>
      <Box textAlign="center">
        <Text fontSize="sm" color={textColor}>Supplier Rating</Text>
        <Progress value={supplierRating * 20} colorScheme="green" size="sm" my={2}/>
        <Text fontSize="2xl" fontWeight="bold">{supplierRating}/5</Text>
      </Box>
      <Box textAlign="center">
        <Text fontSize="sm" color={textColor}>Delivery Success</Text>
        <Progress value={deliverySuccess} colorScheme="blue" size="sm" my={2}/>
        <Text fontSize="2xl" fontWeight="bold">{deliverySuccess}%</Text>
      </Box>
      <Box textAlign="center">
        <Text fontSize="sm" color={textColor}>Dispute Resolution</Text>
        <Text fontSize="2xl" fontWeight="bold" color="green.500">{disputeResolution}</Text>
        <Text fontSize="sm">Average Resolution Time</Text>
      </Box>
    </SimpleGrid>
  );

  // Add AR Viewer component
  const ARViewer = ({ model }) => (
    <Box h="400px" w="100%" bg="blackAlpha.800" borderRadius="lg" p={4}>
      {/* The ArViewer component is removed as per the edit hint. */}
      <Text color="white" textAlign="center" mt={20}>
        AR Preview is currently unavailable.
      </Text>
    </Box>
  );

  // Replace ThermometerProgress component
  const ThermometerProgress = ({ progress, goal }) => {
    const glowColor = progress >= 90 ? 'rgba(72, 187, 120, 0.4)' : 'transparent';
    
    return (
      <Box position="relative" h="30px" w="100%" borderRadius="full" overflow="hidden">
        <Box 
          position="absolute"
          left="0"
          h="100%"
          width={`${progress}%`}
          bgGradient="linear(to-r, blue.400, green.400)"
          transition="width 0.5s ease-out"
          boxShadow={`0 0 15px ${glowColor}`}
        />
        <Box
          position="absolute"
          right="2"
          top="50%"
          transform="translateY(-50%)"
          fontSize="sm"
          color="white"
          zIndex="1"
        >
          {Math.round(progress)}% ({goal - Math.round((goal * progress)/100)} to go)
        </Box>
        <Box 
          position="absolute"
          right="0"
          h="100%"
          w="2px"
          bg="white"
          style={{ left: `${progress}%` }}
        />
      </Box>
    );
  };

  // Enhanced testimonials with verified purchases and interactive elements
  const TestimonialCarousel = () => {
    
    return (
      <Box mt={8} position="relative">
        <Heading size="lg" mb={6} textAlign="center">Verified Buyer Stories</Heading>
        <VStack spacing={6} align="center">
          {testimonials.map((testimonial, index) => (
            <Box
              key={index}
              p={6}
              bg="whiteAlpha.200"
              borderRadius="lg"
              boxShadow="lg"
              textAlign="center"
              w={["100%", "80%", "60%"]}
            >
              <Avatar name={testimonial.name} src={testimonial.avatar} size="2xl" mb={4} />
              <Text fontSize="xl" mb={4}>"{testimonial.text}"</Text>
              <Text fontWeight="bold">{testimonial.name}</Text>
              <Badge colorScheme="green">Saved {testimonial.savings}</Badge>
            </Box>
          ))}
        </VStack>
      </Box>
    );
  };

  // Enhanced calculator with campaign selection and detailed breakdown
  const SavingsCalculator = () => {
    const [selectedCampaignId, setSelectedCampaignId] = useState(1);
    const [systemSize, setSystemSize] = useState(5);
    
    const selectedCampaign = ongoingCampaigns.find(c => c.id === selectedCampaignId);
    const savingsPerUnit = selectedCampaign?.originalPrice - selectedCampaign?.groupPrice || 0;
    const yearlySavings = (monthlyUsage * 0.95 * systemSize * savingsPerUnit) / 100;

    return (
      <Box bg="whiteAlpha.200" p={4} borderRadius="lg" mb={8}>
        <Heading size="md" mb={4}>Advanced Savings Calculator</Heading>
        <SimpleGrid columns={[1, 2, 3]} spacing={4}>
          <FormControl>
            <FormLabel>Select Campaign</FormLabel>
            <Select 
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
              bg="whiteAlpha.800"
            >
              {ongoingCampaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.product}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>System Size (kW)</FormLabel>
            <NumberInput 
              min={1} 
              max={20} 
              value={systemSize}
              onChange={(value) => setSystemSize(value)}
            >
              <NumberInputField bg="whiteAlpha.800" />
            </NumberInput>
          </FormControl>
          <Box>
            <Text>Projected 5-Year Savings:</Text>
            <Heading color="green.400" size="xl">
              R{(yearlySavings * 5).toLocaleString()}
            </Heading>
            <Text fontSize="sm" color="gray.400">
              {systemSize}kW system | {monthlyUsage}kWh/month
            </Text>
          </Box>
        </SimpleGrid>
        <Box mt={4} p={4} bg="blackAlpha.200" borderRadius="md">
          <Text fontSize="sm">Savings Breakdown:</Text>
          <SimpleGrid columns={2} spacing={2}>
            <Text>Unit Price Saving:</Text>
            <Text textAlign="right">R{savingsPerUnit.toLocaleString()}</Text>
            <Text>Total System Saving:</Text>
            <Text textAlign="right">R{(savingsPerUnit * systemSize).toLocaleString()}</Text>
            <Text>Annual Energy Saving:</Text>
            <Text textAlign="right">R{yearlySavings.toLocaleString()}</Text>
          </SimpleGrid>
        </Box>
      </Box>
    );
  };

  // Enhanced pricing visualization with predictions
  const PriceHistoryChart = ({ campaign }) => {
    const [timeframe, setTimeframe] = useState('7d');
    
    const generateData = (period) => {
      // Simulated data generation based on timeframe
      const basePrice = campaign.originalPrice; // Use the first price as the base
      const dataPoints = {
        '7d': 7,
        '30d': 30,
        'all': 365 // Use the length of the prices array for 'all'
      };
      
      return Array.from({ length: dataPoints[period] }, (_, i) => ({
        day: i + 1,
        price: basePrice - ((basePrice - campaign.groupPrice) * (i / dataPoints[period])) + 
          Math.random() * (basePrice * 0.05)
      }));
    };

    return (
      <Box p={4} bg="whiteAlpha.200" borderRadius="lg">
        <Flex justify="space-between" mb={4}>
          <Text fontWeight="bold">Price Evolution</Text>
          <Select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            size="sm" 
            width="100px"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="all">All Time</option>
          </Select>
        </Flex>
        
        <Line
          data={{
            labels: generateData(timeframe).map(d => `Day ${d.day}`),
            datasets: [{
              label: 'Price Per Participant',
              data: generateData(timeframe).map(d => d.price),
              borderColor: '#48BB78',
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 5
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: (context) => 
                    `R${context.raw.toFixed(2)} (Day ${context.dataIndex + 1})`
                }
              }
            },
            scales: {
              y: {
                title: { text: 'Price (R)', display: true },
                ticks: { callback: value => `R${value.toLocaleString()}` }
              }
            }
          }}
        />
        
        <Text mt={2} fontSize="sm" color="gray.400">
          Predicted final price: R{campaign.groupPrice.toLocaleString()} (Current discount: 
          {(((campaign.originalPrice - campaign.groupPrice)/campaign.originalPrice)*100).toFixed(1)}%)
        </Text>
      </Box>
    );
  };

  return (
    <Box
      minH="100vh"
      backgroundImage={`url(${groupBuyingBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed"
      backgroundRepeat="no-repeat"
      position="relative"
      _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'rgba(0, 0, 0, 0.25)', // <-- was 0.5, now 0.25 for less darkness
          zIndex: 1,
      }}
    >
      <Container maxW="container.lg" py={8} position="relative" zIndex={2}>
        <VStack spacing={12} align="stretch"> {/* was 8, now 12 */}
          {/* Header Section */}
          <HStack justify="space-between" align="center" mb={8}>
            <Button leftIcon={<FaArrowLeft />} onClick={() => navigate(-1)} variant="ghost" mr={4}>
              Back
            </Button>
          </HStack>

          <Heading size="xl" color={useColorModeValue('gray.800', 'white')} mb={2} textAlign="center">
            Group Buying Campaigns
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="lg" textAlign="center" mb={6}>
            Join forces to save on solar gear and make energy more affordable for everyone!
          </Text>
          <AnimatePresence mode="wait">
             <MotionText
                key={animationKey}
                color={textColor}
                fontSize="lg"
                textAlign="center"
                mb={6}
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
             >
               {motivationalLines[currentLineIndex]}
             </MotionText>
          </AnimatePresence>

          <TrustPanel 
            supplierRating="4.8" 
            deliverySuccess="94" 
            disputeResolution="24h" 
          />

          <SavingsCalculator />

          {/* Campaigns List */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {ongoingCampaigns.map((campaign) => {
              const progressValue = (campaign.participants / campaign.goal) * 100;
              const savings = campaign.originalPrice - campaign.groupPrice;
              const savingsPercentage = campaign.originalPrice > 0 ? ((savings / campaign.originalPrice) * 100).toFixed(0) : 0;

              return (
                <Card
                  key={campaign.id}
                  bg={cardBg}
                  boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)" // Stronger shadow
                  borderRadius="xl"
                  border="1px solid rgba(255,255,255,0.18)"
                  color={cardColor}
                  p={4} // Add padding
                  m={2} // Add margin between cards
                  minH="480px" // Ensure cards are tall enough
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                >
                  <CardHeader p={0}>
                    <Image
                      src={campaign.image}
                      alt={campaign.product}
                      height="200px"
                      width="100%"
                      objectFit="cover"
                      borderTopRadius="lg"
                    />
                  </CardHeader>
                  <CardBody>
                    <Flex align="center" mb={2}>
                      <Heading size="md">{campaign.product}</Heading>
                    </Flex>

                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text color={cardColor}>
                          <Icon as={FaTag} mr={2} />
                          Original: R{campaign.originalPrice}
                        </Text>
                        {savingsPercentage > 0 && (
                          <Badge colorScheme="green" fontSize="md">
                            Save {savingsPercentage}%
                          </Badge>
                        )}
                      </HStack>

                      <Text fontSize="xl" fontWeight="bold" color="green.500">
                        Group Price: R{campaign.groupPrice}
                      </Text>

                      <Text color={cardColor} noOfLines={2}>{campaign.description}</Text>

                      <HStack>
                        <Icon as={FaUsers} />
                        <Text color={cardColor}>
                          {campaign.participants} of {campaign.goal} joined
                        </Text>
                      </HStack>

                      <ThermometerProgress progress={progressValue} goal={campaign.goal} />
                      <Box display="flex" justifyContent="space-between" mt={2}>
                        {campaign.milestones?.map((milestone, idx) => (
                          <Tooltip 
                            key={idx} 
                            label={`Price drops to R${milestone.price} at ${milestone.participants} participants`}
                          >
                            <Box
                              h="10px"
                              w="10px"
                              borderRadius="full"
                              bg="yellow.400"
                              border="2px solid white"
                              position="relative"
                              top="-8px"
                              left={`calc(${(milestone.participants / campaign.goal) * 100}% - 5px)`}
                            />
                          </Tooltip>
                        ))}
                      </Box>

                      <HStack>
                        <Icon as={FaClock} />
                        <Text color={cardColor}>{campaign.timeLeft}</Text>
                      </HStack>

                      <Button
                        colorScheme="green"
                        onClick={() => handleJoinCampaign(campaign.id)}
                        isDisabled={campaign.participants >= campaign.goal}
                        width="100%"
                        mt={4}
                        transition="transform 0.2s ease-in-out"
                        _hover={{
                            transform: 'scale(1.02)',
                        }}
                      >
                        {campaign.participants >= campaign.goal ? 'Goal Reached!' : 'Join Campaign'}
                      </Button>
                       {/* Back to Home Button */}
                      <Button variant="outline" onClick={() => navigate('/home')} size="sm" width="100%" mt={2}>
                         Back to Home
                      </Button>
                      <Button
                        leftIcon={<Gi3dGlasses />}
                        colorScheme="purple"
                        variant="outline"
                        onClick={() => {
                          setSelectedARModel(campaign.product);
                          onAROpen();
                        }}
                        mt={2}
                      >
                        AR Preview
                      </Button>
                      <Box mt={4}>
                        <PriceHistoryChart campaign={campaign} />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* Create Campaign Button at bottom */}
          <Box textAlign="center" mt={8}>
            <Button
              colorScheme="teal"
              onClick={onOpen}
              leftIcon={<Icon as={FaSolarPanel} />}
              size="lg"
              width={{ base: "full", md: "auto" }}
              transition="transform 0.2s ease-in-out"
              _hover={{
                  transform: 'scale(1.05)',
              }}
            >
              Create New Campaign
            </Button>
          </Box>

          <Box bg="green.800" p={4} borderRadius="lg" mb={8}>
            <Heading size="md" mb={2} color="white">Earn R500 Credit</Heading>
            <Text color="whiteAlpha.800" mb={4}>
              Share your referral code and get R100 credit for each friend who joins a campaign
            </Text>
            <HStack>
              <Input 
                value={referralCode} 
                isReadOnly 
                bg="whiteAlpha.800" 
                fontWeight="bold"
              />
              <Button 
                leftIcon={<FiShare2 />} 
                colorScheme="whiteAlpha" 
                onClick={() => navigator.clipboard.writeText(referralCode)}
              >
                Share
              </Button>
            </HStack>
          </Box>

          <TestimonialCarousel />
        </VStack>
      </Container>

      {/* Create Campaign Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Solar Campaign</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl id="product" isRequired>
                <FormLabel>Product Name</FormLabel>
                <Input
                  name="product"
                  value={newCampaign.product}
                  onChange={handleInputChange}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                />
              </FormControl>

              <FormControl id="description" isRequired>
                <FormLabel>Product Description</FormLabel>
                <Textarea
                  name="description"
                  value={newCampaign.description}
                  onChange={handleInputChange}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                />
              </FormControl>

              <FormControl id="image" isRequired>
                <FormLabel>Product Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  p={1}
                />
                {selectedImage && (
                  <Image
                    src={selectedImage}
                    alt="Selected product"
                    maxH="200px"
                    mt={2}
                    borderRadius="md"
                  />
                )}
              </FormControl>

              <FormControl id="originalPrice" isRequired>
                <FormLabel>Original Price (R)</FormLabel>
                <NumberInput
                  min={0}
                  onChange={(valueString) => handleNumberInputChange('originalPrice', valueString)}
                  value={newCampaign.originalPrice}
                >
                  <NumberInputField bg={inputBgColor} borderColor={inputBorderColor} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl id="groupPrice" isRequired>
                <FormLabel>Group Price (R)</FormLabel>
                <NumberInput
                  min={0}
                  onChange={(valueString) => handleNumberInputChange('groupPrice', valueString)}
                  value={newCampaign.groupPrice}
                >
                  <NumberInputField bg={inputBgColor} borderColor={inputBorderColor} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl id="targetBuyers" isRequired>
                <FormLabel>Target Number of Buyers</FormLabel>
                <NumberInput
                  min={1}
                  onChange={(valueString) => handleNumberInputChange('targetBuyers', valueString)}
                  value={newCampaign.targetBuyers}
                >
                  <NumberInputField bg={inputBgColor} borderColor={inputBorderColor} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl id="deadline" isRequired>
                <FormLabel>Campaign Deadline</FormLabel>
                <Input
                  name="deadline"
                  type="date"
                  value={newCampaign.deadline}
                  onChange={handleInputChange}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel mb="0">Notify me about campaign milestones</FormLabel>
                <Switch 
                  colorScheme="green" 
                  isChecked={showNotificationPref}
                  onChange={(e) => setShowNotificationPref(e.target.checked)}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateCampaign}>
              Create Campaign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AR Modal */}
      <Modal isOpen={isAROpen} onClose={onARClose} size="full">
        <ModalOverlay />
        <ModalContent bg="blackAlpha.900">
          <ModalHeader color="white">{selectedARModel} AR Preview</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <ARViewer model={selectedARModel} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onARClose}>
              Close AR View
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default GroupBuying;
