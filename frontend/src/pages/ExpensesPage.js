import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  useColorModeValue,
  Flex,
  Icon,
  Text,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBill, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

const ExpensesPage = () => {
  const navigate = useNavigate();
  
  // Move all useColorModeValue hooks to the top level
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const itemBg = useColorModeValue('gray.50', 'gray.600');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');

  // Mock data for expenses
  const [expenses] = useState([
    {
      id: 1,
      date: '2024-03-15',
      amount: 150.00,
      category: 'Electricity',
      status: 'Paid'
    },
    {
      id: 2,
      date: '2024-03-10',
      amount: 75.50,
      category: 'Solar Maintenance',
      status: 'Pending'
    },
    {
      id: 3,
      date: '2024-03-05',
      amount: 200.00,
      category: 'Equipment',
      status: 'Paid'
    }
  ]);

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
            <Box p={6} bg={cardBg} borderRadius="lg" shadow="md">
              <Flex align="center" mb={4}>
                <Icon as={FaMoneyBill} w={6} h={6} color="green.500" mr={3} />
                <Text fontSize="lg" fontWeight="bold" color={textColor}>Total Expenses</Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                R{expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </Text>
            </Box>

            <Box p={6} bg={cardBg} borderRadius="lg" shadow="md">
              <Flex align="center" mb={4}>
                <Icon as={FaChartLine} w={6} h={6} color="blue.500" mr={3} />
                <Text fontSize="lg" fontWeight="bold" color={textColor}>Monthly Average</Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                R{(expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length).toFixed(2)}
              </Text>
            </Box>

            <Box p={6} bg={cardBg} borderRadius="lg" shadow="md">
              <Flex align="center" mb={4}>
                <Icon as={FaCalendarAlt} w={6} h={6} color="purple.500" mr={3} />
                <Text fontSize="lg" fontWeight="bold" color={textColor}>Last Payment</Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {expenses[0].date}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Expenses List */}
          <Box p={6} bg={cardBg} borderRadius="lg" shadow="md">
            <Heading size="md" mb={4} color={textColor}>Recent Expenses</Heading>
            <VStack spacing={4} align="stretch">
              {expenses.map((expense) => (
                <Flex
                  key={expense.id}
                  justify="space-between"
                  align="center"
                  p={4}
                  bg={itemBg}
                  borderRadius="md"
                >
                  <Box>
                    <Text fontWeight="bold" color={textColor}>{expense.category}</Text>
                    <Text fontSize="sm" color={subTextColor}>
                      {expense.date}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontWeight="bold" color={textColor}>R{expense.amount.toFixed(2)}</Text>
                    <Badge
                      colorScheme={expense.status === 'Paid' ? 'green' : 'yellow'}
                    >
                      {expense.status}
                    </Badge>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ExpensesPage;
