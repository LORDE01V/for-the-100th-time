import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

// Import Chakra UI Components
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
  Spacer,
  Badge,
  useColorModeValue,
  Progress // Added Progress component
} from '@chakra-ui/react';

// Import Lucide Icons
import {
  BatteryCharging,
  Zap,
  FileText,
  CircleDot,
  Home, AlertCircle, User, Settings
} from 'lucide-react'; // Make sure these icons are correctly imported

// Helper component to convert Lucide icons to Chakra UI icons
const ChakraIcon = ({ icon, ...props }) => {
  const ChakraComp = icon;
  return <Icon as={ChakraComp} {...props} />;
};


function DashboardPage() { // Renamed component to DashboardPage
    const navigate = useNavigate();
    const user = auth.getCurrentUser(); // Get user data

    // Placeholder data - replace with actual data fetching if needed
    const dashboardData = {
        batteryLevel: '85%',
        powerStatus: 'Stable',
        contract: {
            id: 'CNT-2024-001',
            status: 'ACTIVE',
            progress: 33, // in percentage
            paymentsMade: 4,
            totalPayments: 12
        }
    };

    const headingColor = "#333"; // or whatever color you want

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };

     const cardBg = useColorModeValue('white', 'gray.700'); // Card background based on color mode
     const textColor = useColorModeValue('gray.700', 'gray.200'); // Text color
     const bgColor = useColorModeValue('gray.50', 'gray.800'); // Overall background color

    return (
        <Box maxW="1200px" mx="auto" p={[4, 6, 8]} minH="100vh" bg={bgColor}> {/* Centered container */}

            {/* Header / Welcome Bar */}
            <Flex justify="space-between" align="center" mb={8} pt={4}> {/* Added padding top */}
                <Box>
                    <Heading as="h1" size="xl" color={textColor}>
                        Welcome back, {user?.name}
                    </Heading>
                     <Text fontSize="sm" color="gray.500">Your financial dashboard</Text> {/* Subtitle */}
                </Box>
            </Flex>

            {/* Dashboard Content Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>

                {/* Battery Info Block */}
                <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg}>
                    <HStack mb={2}>
                        <ChakraIcon icon={BatteryCharging} boxSize={6} color="yellow.500" />
                        <Heading as="h3" size="md" color={textColor}>Battery</Heading>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {dashboardData.batteryLevel}
                    </Text>
                </Box>

                {/* Power Status Block */}
                <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg}>
                     <HStack mb={2}>
                        <ChakraIcon icon={Zap} boxSize={6} color="green.500" />
                        <Heading as="h3" size="md" color={textColor}>Power Status</Heading>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {dashboardData.powerStatus}
                    </Text>
                </Box>

                {/* Live Contract Block */}
                <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg} gridColumn={{ base: 'span 1', lg: 'span 3' }}> {/* Span full width on larger screens */}
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

                 {/* You can add more sections here using Box and layout components */}
                 <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg} gridColumn={{ base: 'span 1', md: 'span 2', lg: 'span 1' }}> {/* Example of spanning columns */}
                    <Heading as="h3" size="md" mb={2} color={textColor}>Additional Info</Heading>
                    <Text fontSize="sm" color={textColor}>This is another section for more content or charts.</Text>
                 </Box>

                {/* Example of another section */}
                 <Box p={6} boxShadow="md" borderRadius="lg" bg={cardBg}>
                    <Heading as="h3" size="md" mb={2} color={textColor}>Stats Overview</Heading>
                    <Text fontSize="sm" color={textColor}>Stats can go here.</Text>
                 </Box>


            </SimpleGrid>

            {/* Logout Button at the bottom */}
            <Flex justify="center" mt={8}> {/* Use Flex to center the button horizontally */}
                <Button colorScheme="red" onClick={handleLogout} size="sm" width="fit-content"> {/* size="sm" reduces size, width="fit-content" prevents full width */}
                    Logout
                </Button>
            </Flex>

            {/* Note: The bottom fixed navigation bar from the second image is complex
                     and typically built separately. For this refactor focusing on the
                     main dashboard content layout using Chakra, it is not included.
                     You can implement a fixed footer navigation using Chakra's Flex
                     and Box components if needed.
            */}


        </Box>
    );
}

export default DashboardPage; // Export the new component name
