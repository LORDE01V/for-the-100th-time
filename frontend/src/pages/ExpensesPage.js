import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, expenses } from '../services/api';

// Import Chakra UI Components
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
  const toast = useToast();
  const user = auth.getCurrentUser();
  const [expensesList, setExpensesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');
  const tableColor = useColorModeValue('gray.800', 'white');
  const tableHeaderColor = useColorModeValue('gray.600', 'gray.300');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, navigate, toast]);

  // Add useEffect to fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await expenses.getAll();
        console.log('Expenses response:', response); // Debug log
        
        if (response.success && Array.isArray(response.expenses)) {
          setExpensesList(response.expenses);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setError(error.message || 'Failed to fetch expenses');
        toast({
          title: 'Error',
          description: 'Failed to fetch expenses. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [toast]);

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" color={spinnerColor} />
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
        {/* Header with Back to Home button */}
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

        <Heading as="h1" size="xl" color={headingColor} mb={6} textAlign="center">
          Your Energy Expenses
        </Heading>

        <TableContainer>
          <Table variant="simple" colorScheme="teal">
            <Thead>
              <Tr>
                <Th color={tableHeaderColor}>Date</Th>
                <Th color={tableHeaderColor} isNumeric>Amount (ZAR)</Th>
                <Th color={tableHeaderColor}>Purpose</Th>
              </Tr>
            </Thead>
            <Tbody color={tableColor}>
              {isLoading ? (
                <Tr>
                  <Td colSpan={3} textAlign="center">
                    <Spinner size="sm" mr={2} />
                    Loading expenses...
                  </Td>
                </Tr>
              ) : error ? (
                <Tr>
                  <Td colSpan={3} textAlign="center" color="red.500">
                    {error}
                  </Td>
                </Tr>
              ) : expensesList.length > 0 ? (
                expensesList.map((expense) => (
                  <Tr key={expense.id}>
                    <Td>{new Date(expense.date).toLocaleDateString()}</Td>
                    <Td isNumeric>R{expense.amount.toFixed(2)}</Td>
                    <Td>{expense.purpose}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={3} textAlign="center">
                    No expenses recorded yet.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default ExpensesPage;
