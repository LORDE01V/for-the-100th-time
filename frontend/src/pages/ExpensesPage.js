import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Button, VStack, Flex, Icon, Text, SimpleGrid, Badge, useColorModeValue } from '@chakra-ui/react';
import { FaArrowLeft, FaMoneyBill } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import backgroundImageUrl from '../assets/images/Mpho_Jesica_Create_a_high-resolution_background_image_for_a_modern_energy_man_c2363fd3-711f-41c0-b272-af8fbfd0298c.png';

const categories = ['Electricity', 'Solar Maintenance', 'Equipment', 'Battery Replacement', 'Inverter Rental', 'App Subscription'];
const statuses = ['Paid', 'Pending'];

const generateMockExpenses = () => {
  const expenses = [];
  const now = new Date();
  
  // First, add one expense for each category to ensure at least one of each
  categories.forEach((category, index) => {
    const date = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 90); // Random date within last 90 days
    expenses.push({
      id: index + 1,
      date: date.toISOString().split('T')[0],
      amount: parseFloat((Math.random() * 400 + 50).toFixed(2)), // R50 to R450
      category: category,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  });
  
  // Now, generate the remaining expenses to reach 50 total
  const remainingCount = 50 - categories.length;  // 50 total - 6 categories = 44 more
  for (let i = categories.length; i < 50; i++) {
    const date = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 90);
    expenses.push({
      id: i + 1,
      date: date.toISOString().split('T')[0],
      amount: parseFloat((Math.random() * 400 + 50).toFixed(2)),
      category: categories[Math.floor(Math.random() * categories.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return expenses;
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const boxBg = useColorModeValue('white', 'gray.700');

  const [expenses, setExpenses] = useState(generateMockExpenses());
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setExpenses(generateMockExpenses());  // Regenerate every 30 minutes
    }, 30 * 60 * 1000);  // Every 30 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setStartIndex((prevIndex) => (prevIndex + 7) % expenses.length);  // Rotate every 2 minutes
    }, 2 * 60 * 1000);  // Every 2 minutes

    return () => clearInterval(rotationInterval);  // Cleanup on unmount
  }, [expenses]);

  const visibleExpenses = expenses.slice(startIndex, startIndex + 7);  // Slice to show only 7 expenses

  // Calculate total expenses for summary (fixing potential undefined error)
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

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
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          mb={8}
          onClick={() => navigate('/home')}
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
        >
          Back to Home
        </Button>

        <VStack spacing={8} align="stretch">
          <Heading size="xl" color="white">Expenses</Heading>

          {/* Summary Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box
              p={6}
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255, 255, 255, 0.2)"
              borderRadius="lg"
              shadow="md"
            >
              <Flex align="center" mb={4}>
                <Icon as={FaMoneyBill} w={6} h={6} color="green.500" mr={3} />
                <Text fontSize="lg" fontWeight="bold" color="gray.800">Total Expenses</Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                R{totalExpenses.toFixed(2)}
              </Text>
            </Box>
            {/* Add more summary cards if needed, e.g., for charts */}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {visibleExpenses.map((expense) => (
              <Box key={expense.id} p={4} boxShadow="md" borderRadius="md" bg={boxBg}>
                <Text><strong>Date:</strong> {expense.date}</Text>
                <Text><strong>Amount:</strong> R{expense.amount}</Text>
                <Text><strong>Category:</strong> {expense.category}</Text>
                <Badge colorScheme={expense.status === 'Paid' ? 'green' : 'yellow'}>{expense.status}</Badge>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default ExpensesPage; 