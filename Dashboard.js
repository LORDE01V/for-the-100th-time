import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

// Chakra UI
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Badge,
  useColorModeValue,
  Progress,
  Select, // Added Select
  Option, // Added Option
  FormControl, // Added FormControl
  FormLabel, // Added FormLabel
} from '@chakra-ui/react';

// Lucide Icons
import {
  BatteryCharging,
  Zap,
  FileText,
  CircleDot,
} from 'lucide-react';

// Import the Loadshedding widget
import LoadsheddingStatus from '../components/widgets/LoadsheddingStatus';

// Helper to render Lucide as Chakra Icons
const ChakraIcon = ({ icon, ...props }) => {
  const ChakraComp = icon;
  return <Icon as={ChakraComp} {...props} />;
};

function DashboardPage() {
  const navigate = useNavigate();
  const user = auth.getCurrentUser();
  const [selectedArea, setSelectedArea] = useState(null); // State for selected area
  const [areas, setAreas] = useState([]); // State for available areas

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/areas');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAreas(data);
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    };
    fetchAreas();
  }, []); // Empty dependency array means this effect runs once on mount

  const dashboardData = {
    batteryLevel: '85%',
    powerStatus: 'Stable',
    contract: {
      id: 'CNT-2025-001',
      status: 'ACTIVE',
      progress: 33,
      paymentsMade: 4,
      totalPayments: 12,
    },
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box maxW="1200px" mx="auto" p={[4, 6, 8]} minH="100vh" bg={bgColor}>
      <Flex justify="space-between" align="center" mb={8} pt={4}>
        <Box>
          <Heading as="h1" size="xl" color={textColor}>
            Welcome back, {user?.name}
          </Heading>
          <Text fontSize="sm" color="gray.500">Your financial dashboard</Text>
        </Box>
      </Flex>

      {/* Dashboard Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>

        {/* Battery Info */}
        <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <HStack mb={2}>
            <ChakraIcon icon={BatteryCharging} boxSize={6} color="yellow.500" />
            <Heading as="h3" size="md" color={textColor}>Battery</Heading>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            {dashboardData.batteryLevel}
          </Text>
        </Box>

        {/* Power Status */}
        <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <HStack mb={2}>
            <ChakraIcon icon={Zap} boxSize={6} color="green.500" />
            <Heading as="h3" size="md" color={textColor}>Power Status</Heading>
          </HStack>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            {dashboardData.powerStatus}
          </Text>
        </Box>

        {/* Area Selection Dropdown */}
        <Box p={4} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <FormControl>
            <FormLabel htmlFor="area-select" color={textColor}>Select Loadshedding Area</FormLabel>
            <Select
              id="area-select"
              placeholder="Select an area"
              onChange={(e) => {
                const selectedId = e.target.value;
                const area = areas.find(a => a.id === selectedId);
                setSelectedArea(area || null);
              }}
              value={selectedArea ? selectedArea.id : ""}
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Loadshedding Widget Here */}
        <Box p={4} boxShadow="md" borderRadius="lg" bg={cardBg} gridColumn={{ base: 'span 1', lg: 'span 1' }}>
          <LoadsheddingStatus selectedArea={selectedArea} />
        </Box>

        {/* Live Contract Section */}
        <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg} gridColumn={{ base: 'span 1', lg: 'span 3' }}>
          <Flex justify="space-between" align="center" mb={4}>
            <HStack>
              <ChakraIcon icon={FileText} boxSize={6} color="blue.600" />
              <Heading as="h3" size="md" color={textColor}>Live Contract</Heading>
            </HStack>
            <Badge colorScheme="green" variant="solid" borderRadius="full" px={3} py={1} fontSize="xs">
              <HStack spacing={1} alignItems="center">
                <ChakraIcon icon={CircleDot} boxSize={2.5} fill="currentColor"/>
                <Text>LIVE</Text>
              </HStack>
            </Badge>
          </Flex>

          <VStack spacing={4} align="stretch" fontSize="sm" color={textColor}>
            <HStack justify="space-between">
              <Text fontWeight="medium">Contract ID</Text>
              <Text>{dashboardData.contract.id}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="medium">Status</Text>
              <Badge colorScheme="green" variant="subtle">{dashboardData.contract.status}</Badge>
            </HStack>
            <Box>
              <Text fontWeight="medium" mb={1}>Progress</Text>
              <Progress value={dashboardData.contract.progress} size="sm" colorScheme="blue" hasStripe isAnimated borderRadius="full"/>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {dashboardData.contract.paymentsMade}/{dashboardData.contract.totalPayments} payments
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Optional Extra Sections */}
        <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg}>
          <Heading as="h3" size="md" mb={2} color={textColor}>Stats Overview</Heading>
          <Text fontSize="sm" color={textColor}>Stats can go here.</Text>
        </Box>
      </SimpleGrid>

      <Flex justify="center" mt={8}>
        <Button colorScheme="red" onClick={handleLogout} size="sm" width="fit-content">
          Logout
        </Button>
      </Flex>
    </Box>
  );
}

export default DashboardPage;
