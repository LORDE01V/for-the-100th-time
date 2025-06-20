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
} from '@chakra-ui/react';
import { FaUsers, FaClock, FaTag, FaSolarPanel, FaBolt, FaBatteryFull, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import batteryBankImage from '../assets/images/battery_bank_10_kwh.png';
import inverterImage from '../assets/images/inverter__5kw_hybrid.png';
import solarPanelImage from '../assets/images/solar_panel_350w.png';
import { motion, AnimatePresence } from 'framer-motion';

// Create a motion component for Text
const MotionText = motion(Text);

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
      icon: FaSolarPanel
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
      icon: FaBolt
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
      icon: FaBatteryFull
    },
  ], []));

  const [newCampaign, setNewCampaign] = useState({
    product: '',
    description: '',
    originalPrice: 0,
    groupPrice: 0,
    targetBuyers: 10,
    deadline: '',
    image: null,
    category: 'Solar Panels' // Default category
  });

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
  const headingColor = useColorModeValue('gray.800', 'white');
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');

  // Define colors for glassmorphism effect on cards
  const glassCardBg = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(26, 32, 44, 0.15)');
  const glassBorderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  const glassBoxShadow = useColorModeValue('0 4px 12px rgba(0, 0, 0, 0.15)', '0 4px 12px rgba(0, 0, 0, 0.5)'); // Adjust shadow for depth

  // Define hover box shadow using useColorModeValue at the top level
  const hoverBoxShadow = useColorModeValue('0 8px 16px rgba(0, 0, 0, 0.2)', '0 8px 16px rgba(0, 0, 0, 0.6)');

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

  const handleJoinCampaign = (campaignId) => {
    console.log(`Joining campaign with ID: ${campaignId}`);
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
      category: 'Solar Panels'
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
      <Container maxW="container.lg" py={8} position="relative" zIndex={2}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
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

          <Heading size="xl" color={headingColor} mb={2} textAlign="center">Group Buying Campaigns</Heading>
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

          {/* Campaigns List */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {ongoingCampaigns.map((campaign) => {
              const progressValue = (campaign.participants / campaign.goal) * 100;
              const savings = campaign.originalPrice - campaign.groupPrice;
              const savingsPercentage = campaign.originalPrice > 0 ? ((savings / campaign.originalPrice) * 100).toFixed(0) : 0;

              return (
                <Card
                  key={campaign.id}
                  bg={glassCardBg}
                  borderWidth="1px"
                  borderColor={glassBorderColor}
                  boxShadow={glassBoxShadow}
                  borderRadius="lg"
                  backdropFilter="blur(10px)"
                  transition="all 0.3s ease-in-out"
                  _hover={{
                    transform: 'translateY(-5px)',
                    boxShadow: hoverBoxShadow,
                  }}
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

                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text color={textColor}>
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

                      <Text color={textColor} noOfLines={2}>{campaign.description}</Text>

                      <HStack>
                        <Icon as={FaUsers} />
                        <Text color={textColor}>
                          {campaign.participants} of {campaign.goal} joined
                        </Text>
                      </HStack>

                      <Progress value={progressValue} size="sm" colorScheme="blue" hasStripe isAnimated />

                      <HStack>
                        <Icon as={FaClock} />
                        <Text color={textColor}>{campaign.timeLeft}</Text>
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
    </Box>
  );
}

export default GroupBuying;
