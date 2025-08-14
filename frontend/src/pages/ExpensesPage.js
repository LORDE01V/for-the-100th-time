import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { auth } from '../services/api';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  Flex,
  Icon,
  Text,
  SimpleGrid,
  Badge,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBill, FaChartLine, FaCalendarAlt, FaBolt, FaSync } from 'react-icons/fa';
import backgroundImageUrl from '../assets/images/Mpho_Jesica_Create_a_high-resolution_background_image_for_a_modern_energy_man_c2363fd3-711f-41c0-b272-af8fbfd0298c.png';

const categories = ['Electricity', 'Solar Maintenance', 'Equipment', 'Battery Replacement', 'Inverter Rental', 'App Subscription'];
const statuses = ['Paid', 'Pending'];

const ExpensesPage = () => {
  const navigate = useNavigate();

  // All color mode hooks at the top
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'white');
  const summaryTextColor = useColorModeValue('green.500', 'white');
  const monthlyTextColor = useColorModeValue('blue.500', 'white');
  const lastPaymentTextColor = useColorModeValue('purple.500', 'white');
  const boxBg = useColorModeValue('white', 'rgba(0, 0, 0, 0.6)');
  const boxBorderColor = useColorModeValue('gray.200', 'gray.600');

  // State for expenses, replacing mock data
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // State for the latest top-up
  const [latestTopup, setLatestTopup] = useState(null);
  const [loadingTopup, setLoadingTopup] = useState(true);

  // Get user from state to prevent re-renders
  const [user, setUser] = useState(null);

  // Add this state hook at the top with other hooks
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set the user from auth service once
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
  }, []); // Empty dependency array means this runs only once on mount

  useEffect(() => {
    if (!user?.id) {
      setLoadingTopup(false);
      setLoadingExpenses(false);
      return;
    }

    async function fetchLatestTopup() {
      setLoadingTopup(true);
      try {
        const response = await api.get('/api/user/latest-topup', {
          params: { user_id: user.id },
        });
        setLatestTopup(response.data.transaction);
      } catch (error) {
        setLatestTopup(null);
      } finally {
        setLoadingTopup(false);
      }
    }

    async function fetchExpenses() {
        setLoadingExpenses(true);
        try {
            const response = await api.get('/api/user/expenses', {
                params: { user_id: user.id },
            });
            setExpenses(response.data.expenses);
        } catch (error) {
            setExpenses([]);
        } finally {
            setLoadingExpenses(false);
        }
    }

    fetchLatestTopup();
    fetchExpenses();
  }, [user]); // This will now only run when the user state is set

  // Show a full-page spinner if user is not loaded yet or data is loading
  if (!user || loadingExpenses) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.900">
        <Spinner size="xl" color="blue.400" />
      </Flex>
    );
  }
  
  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // Your transaction loading logic here
      // Example:
      // const response = await api.getTransactions();
      // setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      backgroundImage={`url(${backgroundImageUrl})`}
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
      <Container maxW="container.xl" py={8} position="relative" zIndex={2}>
        <Flex justify="space-between" align="center" mb={8}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/home')}
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            Back to Home
          </Button>
          <Button
            leftIcon={<FaSync />}
            variant="ghost"
            onClick={loadTransactions}
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </Flex>

        <VStack spacing={8} align="stretch">
          <Heading size="xl" color={headingColor}>
            Expenses
          </Heading>

          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box
              bg={boxBg}
              boxShadow="xl"
              borderRadius="xl"
              p={8}
              position="relative"
              zIndex={2}
              backdropFilter="blur(16px)"
              border="1px solid"
              borderColor={boxBorderColor}
            >
              <Flex align="center" mb={4}>
                <Icon as={FaMoneyBill} w={6} h={6} color="green.500" mr={3} />
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  Total Expenses
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color={summaryTextColor}>
                {isLoading ? <Spinner size="sm" /> : `R${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}`}
              </Text>
            </Box>

            <Box
              bg={boxBg}
              boxShadow="xl"
              borderRadius="xl"
              p={8}
              position="relative"
              zIndex={2}
              backdropFilter="blur(16px)"
              border="1px solid"
              borderColor={boxBorderColor}
            >
              <Flex align="center" mb={4}>
                <Icon as={FaChartLine} w={6} h={6} color="blue.500" mr={3} />
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  Monthly Average
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color={monthlyTextColor}>
                R
                {(expenses.length > 0
                  ? expenses.reduce((sum, exp) => sum + exp.amount, 0) /
                    expenses.length
                  : 0
                ).toFixed(2)}
              </Text>
            </Box>

            <Box
              bg={boxBg}
              boxShadow="xl"
              borderRadius="xl"
              p={8}
              position="relative"
              zIndex={2}
              backdropFilter="blur(16px)"
              border="1px solid"
              borderColor={boxBorderColor}
            >
              <Flex align="center" mb={4}>
                <Icon as={FaCalendarAlt} w={6} h={6} color="purple.500" mr={3} />
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  Last Payment
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color={lastPaymentTextColor}>
                {expenses.length > 0 ? new Date(expenses[0].date).toLocaleDateString() : 'N/A'}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Most Recent Top-Up Section */}
          <Box
            bg={boxBg}
            boxShadow="xl"
            borderRadius="xl"
            p={8}
            position="relative"
            zIndex={2}
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor={boxBorderColor}
          >
            <Heading size="md" mb={4} color={headingColor}>
              Most Recent Top-Up
            </Heading>
            {loadingTopup ? (
              <Flex justify="center" align="center" minH="60px">
                <Spinner size="md" color="blue.400" />
              </Flex>
            ) : latestTopup ? (
              <Flex
                justify="space-between"
                align="center"
                p={4}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="md"
              >
                <Box>
                  <Flex align="center" mb={1}>
                    <Icon as={FaBolt} w={4} h={4} color="yellow.400" mr={2} />
                    <Text fontWeight="bold" color={textColor}>
                      {latestTopup.transaction_type === 'recharge'
                        ? 'Recharge'
                        : 'Top-Up'}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color={subTextColor}>
                    {new Date(latestTopup.created_at).toLocaleString()}
                  </Text>
                  {(latestTopup.promo_code || latestTopup.voucher_code) && (
                    <Text fontSize="xs" color={subTextColor}>
                      {latestTopup.promo_code && <>Promo: {latestTopup.promo_code} </>}
                      {latestTopup.voucher_code && <>Voucher: {latestTopup.voucher_code}</>}
                    </Text>
                  )}
                </Box>
                <Box textAlign="right">
                  <Text fontWeight="bold" color={textColor}>
                    R{Number(latestTopup.amount).toFixed(2)}
                  </Text>
                  <Badge colorScheme="green">Success</Badge>
                </Box>
              </Flex>
            ) : (
              <Text color={subTextColor}>No top-up found.</Text>
            )}
          </Box>

          {/* Expenses List */}
          <Box
            bg={boxBg}
            boxShadow="xl"
            borderRadius="xl"
            p={8}
            position="relative"
            zIndex={2}
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor={boxBorderColor}
          >
            <Heading size="md" mb={4} color={headingColor}>
              Recent Expenses
            </Heading>
            <VStack spacing={4} align="stretch">
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <Flex
                    key={expense.id}
                    justify="space-between"
                    align="center"
                    p={4}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius="md"
                  >
                    <Box>
                      <Text fontWeight="bold" color={textColor}>
                        {expense.category}
                      </Text>
                      <Text fontSize="sm" color={subTextColor}>
                        {new Date(expense.date).toLocaleDateString()}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="bold" color={textColor}>
                        R{expense.amount.toFixed(2)}
                      </Text>
                      <Badge
                        colorScheme={expense.status === 'Paid' ? 'green' : 'yellow'}
                      >
                        {expense.status}
                      </Badge>
                    </Box>
                  </Flex>
                ))
              ) : (
                <Text color={subTextColor}>No recent expenses found.</Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ExpensesPage;