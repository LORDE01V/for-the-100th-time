import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service is still used
import { FaArrowLeft } from 'react-icons/fa'; // Import FaArrowLeft

// Import Chakra UI Components
import {
  Box,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast, // For displaying messages
  useColorModeValue, // For light/dark mode styling
  Spinner, // Added Spinner for loading state
  HStack, // Added HStack for horizontal back button layout
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select
} from '@chakra-ui/react';

import topUpBackground from '../assets/images/Mpho_Jesica_Create_a_high-resolution_background_image_for_a_modern_energy_man_d222483d-c556-42dc-bd4b-3883260f86a4.png';  // Import the new background image
import api from '../services/api';

function TopUpPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State for form fields and balance
  const [currentBalance, setCurrentBalance] = useState(150.50); // Mock initial balance
  const [amount, setAmount] = useState(''); // Amount to top-up
  const [promoCode, setPromoCode] = useState(''); // Optional promo code
  const [voucherCode, setVoucherCode] = useState(''); // Optional voucher code
  const [isProcessing, setIsProcessing] = useState(false); // Loading state for top-up button

  // New state for Auto-Top-Up
  const [isAutoTopUpEnabled, setIsAutoTopUpEnabled] = useState(false);
  const [minBalance, setMinBalance] = useState('');
  const [autoTopUpAmount, setAutoTopUpAmount] = useState('');
  const [autoTopUpFrequency, setAutoTopUpFrequency] = useState('weekly');

  const [transactionType, setTransactionType] = useState('topup'); // New state for transaction type

  const user = auth.getCurrentUser(); // Get current user data

  // Chakra UI hook for dynamic colors based on color mode
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');
  const buttonColorScheme = useColorModeValue('green', 'teal'); // Use green/teal for top-up
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');

  // Styles for the glassmorphism effect on the form Box
  const glassmorphismBoxStyles = {
    bg: useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(26, 32, 44, 0.15)'), // Semi-transparent background
    backdropFilter: 'blur(10px)', // Blur effect
    boxShadow: useColorModeValue('lg', 'dark-lg'), // Shadow for depth
    borderRadius: 'lg', // Rounded corners
  };

  // Basic check if user data is available. ProtectedRoute handles the main redirection,
  // but this can help if the user object is null for some reason after landing here.
  useEffect(() => {
      if (!user) {
          navigate('/login');
      }
  }, [user, navigate]); // Effect runs on component mount and if user/navigate changes

  // Handler for Auto-Top-Up settings
  const handleAutoTopUpSave = () => {
    if (!minBalance || !autoTopUpAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields for Auto Top-Up.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Simulate saving Auto-Top-Up settings
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsAutoTopUpEnabled(true);
      onClose();
      toast({
        title: 'Auto Top-Up Enabled',
        description: `Your account will be topped up with R${autoTopUpAmount} when balance falls below R${minBalance}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1500);
  };

  // Handler for the Top-Up button click
  const handleTopUp = async (e) => {
    e.preventDefault();
  
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
        toast({
            title: 'Invalid Amount',
            description: 'Please enter a valid positive amount.',
            status: 'warning',
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    setIsProcessing(true);
  
    const data = {
        user_id: user?.id,  // Using optional chaining for safety
        amount: topUpAmount,
        promo_code: promoCode,
        voucher_code: voucherCode,
        transaction_type: transactionType,
        is_auto_topup: isAutoTopUpEnabled,
        min_balance: isAutoTopUpEnabled ? parseFloat(minBalance) : null,
        auto_topup_amount: isAutoTopUpEnabled ? parseFloat(autoTopUpAmount) : null,
        auto_topup_frequency: isAutoTopUpEnabled ? autoTopUpFrequency : null,
    };

    try {
        const response = await api.post('/api/topup', data); // Remove manual CSRF handling
      
      if (response.status === 200 && response.data.success) {
        // Update balance and show success
        setCurrentBalance(prev => prev + topUpAmount);
        toast({
          title: 'Success!',
          description: `New balance: R${(currentBalance + topUpAmount).toFixed(2)}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Payment service unavailable';
      
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Render loading spinner if user is being checked (though ProtectedRoute handles the redirect)
  if (!user) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
                <Spinner size="xl" color={spinnerColor} />
            </Flex>
        );
    }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={4}
      backgroundImage={`url(${topUpBackground})`}  // Replace gradient with the new image
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
          bg: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent overlay for readability
          zIndex: 1,
      }}
    >
      <Box
        maxW="md"
        w="full"
        {...glassmorphismBoxStyles}  // Existing glassmorphism styles
        boxShadow="md"
        borderRadius="lg"
        p={6}
        textAlign="center"
        position="relative"
        zIndex={2}
        backdropFilter="blur(16px)"  // Increase blur for stronger glassmorphism effect
      >
         {/* Back to Home Button in HStack */}
         <HStack justify="space-between" w="full" mb={8} align="center">
             <Button
               leftIcon={<FaArrowLeft />}
               variant="ghost"
               onClick={() => navigate('/home')}
               color={headingColor}
             >
                Back to Home
             </Button>
         </HStack>

        {/* Main Heading placed below the HStack */}
        <Heading as="h2" size="xl" mb={6} color={headingColor} textAlign="center">
          Top-Up / Recharge
        </Heading>

        {/* Current Balance Display */}
        <Box mb={6}>
            <Text fontSize="md" color={textColor}>Current Energy Credit Balance:</Text>
            <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                R{currentBalance.toFixed(2)} {/* Display balance formatted */}
            </Text>
        </Box>


        <VStack as="form" spacing={4} onSubmit={handleTopUp} noValidate>
          {/* Transaction Type Selection */}
          <FormControl id="transaction-type">
            <FormLabel>Transaction Type</FormLabel>
            <Select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="topup">Top-Up</option>
              <option value="recharge">Recharge</option>
            </Select>
          </FormControl>

          {/* Amount Input */}
          <FormControl id="top-up-amount">
            <FormLabel>Amount (ZAR)</FormLabel>
            <Input
              type="number" // Use number type for currency
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01" // Allow decimal values
              min="0" // Ensure positive amount
            />
          </FormControl>

          {/* Optional Promo Code Input */}
          <FormControl id="promo-code">
            <FormLabel>Promo Code (Optional)</FormLabel>
            <Input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </FormControl>

           {/* Optional Voucher Code Input */}
          <FormControl id="voucher-code">
            <FormLabel>Voucher Code (Optional)</FormLabel>
            <Input
              type="text"
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
          </FormControl>


          {/* Top-Up Button */}
          <Button
            type="submit"
            colorScheme={buttonColorScheme}
            size="lg"
            fontSize="md"
            isLoading={isProcessing}
            loadingText="Processing..."
            w="full"
            mt={4}
          >
            {transactionType === 'topup' ? 'Top-Up Now' : 'Recharge Now'}
          </Button>
        </VStack>

        {/* Divider */}
        <Divider my={6} />

        {/* Auto Top-Up Section */}
        <Box>
          <Heading as="h3" size="md" mb={4} color={headingColor}>
            Auto Top-Up Settings
          </Heading>
          
          {isAutoTopUpEnabled ? (
            <Alert status="success" mb={4} bg="rgba(255, 255, 255, 0.15)" backdropFilter="blur(10px)" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Auto Top-Up is Active</AlertTitle>
                <AlertDescription>
                  Your account will be topped up with R{autoTopUpAmount} when balance falls below R{minBalance}.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Text color={textColor} mb={4}>
              Enable automatic top-ups to ensure you never run out of credit.
            </Text>
          )}

          <Button
            colorScheme={isAutoTopUpEnabled ? "red" : "green"}
            variant="outline"
            w="full"
            onClick={onOpen}
          >
            {isAutoTopUpEnabled ? "Modify Auto Top-Up" : "Set Up Auto Top-Up"}
          </Button>
        </Box>

        {/* Auto Top-Up Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Auto Top-Up Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Minimum Balance (R)</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={minBalance}
                    onChange={(e) => setMinBalance(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Auto Top-Up Amount (R)</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g., 200"
                    value={autoTopUpAmount}
                    onChange={(e) => setAutoTopUpAmount(e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    value={autoTopUpFrequency}
                    onChange={(e) => setAutoTopUpFrequency(e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleAutoTopUpSave}
                isLoading={isProcessing}
              >
                Save Settings
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
}

export default TopUpPage;
