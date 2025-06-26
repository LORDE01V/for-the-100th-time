import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service handles user data
import axios from 'axios'; // Assuming axios is used for API calls. Adjust if using your api.js service.

// Import Chakra UI Components
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  useColorModeValue,
  Spinner,
  Text,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  HStack, // This line is essential for the HStack component to be defined
  Select,
  Divider,
  Icon,
  Badge,
} from '@chakra-ui/react';

// Import icons
// Added import for FaArrowLeft from react-icons/fa
import { FaArrowLeft, FaCreditCard, FaMoneyBill, FaWallet } from 'react-icons/fa';
import { SiVisa, SiMastercard, SiAmericanexpress } from 'react-icons/si';

// Define API base URL constant
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Add this function before the ProfilePage component
const getCardIcon = (paymentType, cardNumber = '') => {
  if (paymentType === 'ewallet') {
    return FaWallet;
  }
  // First determine the card brand based on the first digit
  const firstDigit = cardNumber.charAt(0);
  if (cardNumber) {
    switch (firstDigit) {
      case '4':
        return SiVisa;
      case '5':
        return SiMastercard;
      case '3':
        return SiAmericanexpress;
      default:
        break;
    }
  }
  
  // If no card number or no matching brand, return generic icon
  switch (paymentType) {
    case 'credit_card':
      return FaCreditCard;
    case 'debit_card':
      return FaMoneyBill;
    default:
      return FaCreditCard;
  }
};

function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();

  // State for form fields
  const [profileData, setProfileData] = useState({
    full_name: '',
    email_address: '',
    phone_number: '',
    address: '',
    energy_motto: ''
  });
  console.log('Initial profileData state:', profileData);
  const [isSaving, setIsSaving] = useState(false); // Loading state for saving account changes

  // Add new state for payment methods
  const [paymentMethods, setPaymentMethods] = useState({
    type: '',
    cardNumber: '',
    expiryDate: '',
    cardHolderName: '',
    isDefault: false,
    ewallet_provider: '',  // Added for eWallet handling
    ewallet_identifier: ''  // Added for eWallet handling
  });

  // Add new state for saved payment methods
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

  const user = auth.getCurrentUser(); // Get current user data from localStorage

  // Chakra UI hook for dynamic colors based on color mode
  // Keep bgColor as it's used in the loading state
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const headingColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const avatarBg = useColorModeValue('gray.300', 'gray.600');
  const avatarColor = useColorModeValue('gray.800', 'white');
  const fileButtonBg = useColorModeValue('gray.100', 'gray.600');
  const fileButtonBorderColor = useColorModeValue('gray.300', 'gray.600');
  const fileButtonColor = useColorModeValue('gray.700', 'whiteAlpha.800');
  const fileButtonHoverBg = useColorModeValue('gray.200', 'gray.500');

  // Define the spinner color using useColorModeValue at the top level:
  const spinnerColor = useColorModeValue('blue.500', 'blue.300'); // Define the spinner color here

  const [profileStatus, setProfileStatus] = useState(null);

  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const inputFocusBorderColor = useColorModeValue('blue.500', 'blue.300');
  const successIconColor = useColorModeValue('green.500', 'green.500');
  const warningIconColor = useColorModeValue('red.500', 'red.500');
  const successTextColor = useColorModeValue('green.500', 'green.500');
  const warningTextColor = useColorModeValue('red.500', 'red.500');

  // Add a loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to access this page',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
          },
        });
        
        if (response.data.success) {
          setProfileData(response.data.profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch profile data.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate, toast]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setProfileStatus(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/profile`,
        {
          ...profileData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );

      if (response.data.success) {
        setProfileData(response.data.profile);
        toast({
          title: 'Profile updated.',
          description: 'Your profile information has been saved.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setProfileStatus({ status: 'success', message: 'Profile updated successfully' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Update failed.',
        description: error.response?.data?.message || 'An error occurred while saving.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProfileStatus({ status: 'error', message: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setProfileStatus(null), 5000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const formData = new FormData();
      formData.append('profile_picture', file);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/profile/picture`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${auth.getToken()}`,
            },
          }
        );
        if (response.data.success) {
          setProfileData(prev => ({
            ...prev,
            profilePictureUrl: response.data.profile_picture_url
          }));
          toast({
            title: 'Profile picture updated',
            description: 'Your profile picture has been updated successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: error.response?.data?.message || 'Failed to upload profile picture',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handlePaymentMethodChange = (e) => {
    const { name, value } = e.target;
    setPaymentMethods(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePaymentMethod = () => {
    const errors = {};
    if (!paymentMethods.type) errors.type = 'Payment type is required';
    if (paymentMethods.type === 'credit_card' || paymentMethods.type === 'debit_card') {
      if (!paymentMethods.cardNumber || !/^\d{16}$/.test(paymentMethods.cardNumber.replace(/\s/g, ''))) errors.cardNumber = 'Invalid card number (must be 16 digits)';
      if (!paymentMethods.expiryDate || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentMethods.expiryDate)) errors.expiryDate = 'Invalid expiry date (MM/YY)';
      if (!paymentMethods.cardHolderName) errors.cardHolderName = 'Card holder name is required';
    }
    if (paymentMethods.type === 'ewallet') {
      if (!paymentMethods.ewallet_provider) errors.ewallet_provider = 'eWallet provider is required';
      if (!paymentMethods.ewallet_identifier) errors.ewallet_identifier = 'eWallet email/username is required';
    }
    return errors;
  };

  // Add this useEffect to fetch payment methods when the component mounts
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoadingPaymentMethods(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/payment-methods`,
          {
            headers: {
              Authorization: `Bearer ${auth.getToken()}`,
            },
          }
        );

        console.log('Payment Methods API Response:', response.data); // Debug log

        if (response.data.success) {
          const paymentMethods = response.data.payment_methods;
          console.log('Raw payment methods:', paymentMethods); // Debug log

          // Sort the payment methods before setting them in state
          const sortedMethods = paymentMethods.sort((a, b) => {
            console.log('Comparing methods:', { a, b }); // Debug log
            if (a.is_default && !b.is_default) return -1;
            if (!a.is_default && b.is_default) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
          });

          console.log('Sorted payment methods:', sortedMethods); // Debug log
          setSavedPaymentMethods(sortedMethods);
        } else {
          throw new Error(response.data.message || 'Failed to load payment methods');
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load payment methods',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [toast]);
  

  // Update the handleSavePaymentMethod function
  const handleSavePaymentMethod = async () => {
    // Add validation
    const errors = validatePaymentMethod();
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Validation Error',
        description: Object.values(errors)[0],
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payment-methods`,
        {
          type: paymentMethods.type,
          cardNumber: paymentMethods.cardNumber,
          expiryDate: paymentMethods.expiryDate,
          cardHolderName: paymentMethods.cardHolderName,
          isDefault: paymentMethods.isDefault
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );

      if (response.data.success) {
        // Fetch updated payment methods after saving
        const updatedResponse = await axios.get(
          `${API_BASE_URL}/api/payment-methods`,
          {
            headers: {
              Authorization: `Bearer ${auth.getToken()}`,
            },
          }
        );

        if (updatedResponse.data.success) {
          setSavedPaymentMethods(updatedResponse.data.payment_methods);
        }

        toast({
          title: 'Payment method saved.',
          description: 'Your payment method has been saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Reset the form
        setPaymentMethods({
          type: '',
          cardNumber: '',
          expiryDate: '',
          cardHolderName: '',
          isDefault: false
        });
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save payment method. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add this function to handle setting default payment method
  const handleSetDefault = async (paymentMethodId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/payment-methods/${paymentMethodId}/default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );
      
      if (response.data.success) {
        setSavedPaymentMethods(prev => 
          prev.map(method => ({
            ...method,
            is_default: method.id === paymentMethodId
          }))
        );
        toast({
          title: 'Default payment method updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update default payment method',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add this function to handle deleting payment method
  const handleDeletePaymentMethod = async (paymentMethodId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/payment-methods/${paymentMethodId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );
      
      if (response.data.success) {
        setSavedPaymentMethods(prev => 
          prev.filter(method => method.id !== paymentMethodId)
        );
        toast({
          title: 'Payment method deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete payment method',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
      }}
    >
      <Box maxW="container.lg" mx="auto" p={{ base: 4, md: 6 }} position="relative" zIndex={2}>
        {/* Header */}
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

        <Heading as="h1" size="xl" color={headingColor} mb={8} textAlign="center">
          User Profile & Settings
        </Heading>

        {/* Profile Picture Section */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} width="100%">
          <CardHeader>
            <Heading size="md">Profile Picture</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="center" width="100%">
              <Avatar
                size="xl"
                name={profileData.full_name}
                src={profileData.profilePictureUrl || ''}
                bg={avatarBg}
                color={avatarColor}
              />
              <FormControl id="profilePicture">
                <FormLabel>Change Profile Picture</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  pt={1}
                  sx={{
                    '::file-selector-button': {
                      mr: 4,
                      py: 2,
                      px: 4,
                      borderRadius: 'md',
                      border: '1px solid',
                      borderColor: fileButtonBorderColor,
                      bg: fileButtonBg,
                      color: fileButtonColor,
                      cursor: 'pointer',
                      outline: 'none',
                      _hover: {
                        bg: fileButtonHoverBg,
                      },
                    }
                  }}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Profile Information Section */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} width="100%">
          <CardHeader>
            <Heading size="md">Account Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} as="form" width="100%">
              <FormControl id="full_name">
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _focus={{ borderColor: inputFocusBorderColor }}
                />
              </FormControl>

              <FormControl id="email_address">
                <FormLabel>Email Address</FormLabel>
                <Input
                  name="email_address"
                  type="email"
                  value={profileData.email_address}
                  onChange={handleInputChange}
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _focus={{ borderColor: inputFocusBorderColor }}
                />
              </FormControl>

              <FormControl id="phone_number">
                <FormLabel>Phone Number</FormLabel>
                <Input
                  type="tel"
                  value={profileData.phone_number}
                  isReadOnly
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _focus={{ borderColor: inputFocusBorderColor }}
                />
              </FormControl>

              <FormControl id="address">
                <FormLabel>Address</FormLabel>
                <Input
                  type="text"
                  value={profileData.address}
                  isReadOnly
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _focus={{ borderColor: inputFocusBorderColor }}
                />
              </FormControl>

              <FormControl id="energy_motto">
                <FormLabel>Energy Motto</FormLabel>
                <Input
                  type="text"
                  value={profileData.energy_motto || ''}
                  isReadOnly
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _focus={{ borderColor: inputFocusBorderColor }}
                  placeholder="No energy motto set"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Add this section right after the Account Information Card */}
        {profileStatus && (
          <Box mt={4} p={4} bg={profileStatus.status === 'success' ? 'green.100' : 'red.100'} borderRadius="md" color={profileStatus.status === 'success' ? successTextColor : warningTextColor}>
            <HStack>
              {profileStatus.status === 'success' && (
                <Icon name="check-circle" color={successIconColor} />
              )}
              {profileStatus.status === 'error' && (
                <Icon name="warning" color={warningIconColor} />
              )}
              <Text>{profileStatus.message}</Text>
            </HStack>
          </Box>
        )}

        {/* Saved Payment Methods Section */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} width="100%">
          <CardHeader>
            <Heading size="md">Saved Payment Methods</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} width="100%">
              {isLoadingPaymentMethods ? (
                <Spinner />
              ) : savedPaymentMethods.length > 0 ? (
                savedPaymentMethods.map((method) => (
                  <Box key={method.id} p={4} borderWidth="1px" borderRadius="md" borderColor={method.is_default ? 'blue.500' : borderColor} width="full" mb={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={getCardIcon(method.payment_type, method.card_number)} />
                          <Text fontWeight="bold">
                            {method.payment_type === 'credit_card' ? 'Credit Card' : method.payment_type === 'debit_card' ? 'Debit Card' : `${method.ewallet_provider} eWallet`}
                          </Text>
                          {method.is_default && <Badge colorScheme="blue">Default</Badge>}
                        </HStack>
                        {method.payment_type === 'ewallet' ? (
                          <>
                            <Text>{method.ewallet_identifier}</Text>
                          </>
                        ) : (
                          <>
                            <Text>**** **** **** {method.card_number.slice(-4)}</Text>
                            <Text fontSize="sm" color={mutedTextColor}>
                              Expires {method.expiry_date}
                            </Text>
                            <Text fontSize="sm" color={mutedTextColor}>
                              {method.card_holder_name}
                            </Text>
                          </>
                        )}
                      </VStack>
                      <HStack>
                        {!method.is_default && (
                          <Button size="sm" variant="ghost" onClick={() => handleSetDefault(method.id)}>
                            Set as Default
                          </Button>
                        )}
                        <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeletePaymentMethod(method.id)}>
                          Delete
                        </Button>
                      </HStack>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Text color={mutedTextColor}>No saved payment methods</Text>
              )}

              <Divider />

              {/* Add new payment method form */}
              <FormControl isRequired>
                <FormLabel>Payment Type</FormLabel>
                <Select
                  value={paymentMethods.type}
                  onChange={handlePaymentMethodChange}
                  name="type"
                  bg={inputBgColor}
                  borderColor={borderColor}
                  _hover={{ borderColor: 'blue.500' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                >
                  <option value="">Select Payment Type</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="ewallet">eWallet</option>
                </Select>
              </FormControl>

              {/* Show card-specific fields only if payment type is credit or debit card */}
              {paymentMethods.type && 
               (paymentMethods.type === 'credit_card' || paymentMethods.type === 'debit_card') && (
                <>
                  <FormControl isRequired>
                    <FormLabel>Card Number</FormLabel>
                    <Input
                      type="text"
                      name="cardNumber"
                      value={paymentMethods.cardNumber}
                      onChange={handlePaymentMethodChange}
                      placeholder="1234 5678 9012 3456"
                      bg={inputBgColor}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'blue.500' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Card Holder Name</FormLabel>
                    <Input
                      type="text"
                      name="cardHolderName"
                      value={paymentMethods.cardHolderName}
                      onChange={handlePaymentMethodChange}
                      placeholder="John Doe"
                      bg={inputBgColor}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'blue.500' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Expiry Date</FormLabel>
                    <Input
                      type="text"
                      name="expiryDate"
                      value={paymentMethods.expiryDate}
                      onChange={handlePaymentMethodChange}
                      placeholder="MM/YY"
                      bg={inputBgColor}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'blue.500' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                    />
                  </FormControl>
                </>
              )}

              {/* Show eWallet-specific fields if payment type is eWallet */}
              {paymentMethods.type === 'ewallet' && (
                <>
                  <FormControl isRequired>
                    <FormLabel>eWallet Provider</FormLabel>
                    <Select
                      name="ewallet_provider"
                      value={paymentMethods.ewallet_provider}
                      onChange={handlePaymentMethodChange}
                      bg={inputBgColor}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'blue.500' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                    >
                      <option value="">Select Provider</option>
                      <option value="paypal">PayPal</option>
                      <option value="venmo">Venmo</option>
                      <option value="cashapp">Cash App</option>
                      <option value="zelle">Zelle</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>eWallet Email/Username</FormLabel>
                    <Input
                      type="text"
                      name="ewallet_identifier"
                      value={paymentMethods.ewallet_identifier}
                      onChange={handlePaymentMethodChange}
                      placeholder="Enter your eWallet email or username"
                      bg={inputBgColor}
                      borderColor={borderColor}
                      _hover={{ borderColor: 'blue.500' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                    />
                  </FormControl>
                </>
              )}

              <Button
                colorScheme="blue"
                onClick={handleSavePaymentMethod}
                isLoading={isSaving}
                loadingText="Saving..."
                width="full"
              >
                Save Payment Method
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Billing History Section */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Billing History</Heading>
          </CardHeader>
          <CardBody>
            <Text color={textColor}>View your billing history and invoices here (Requires backend implementation).</Text>
          </CardBody>
        </Card>

        {/* Subscription Plan Info Section */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Your Subscription Plan</Heading>
          </CardHeader>
          <CardBody>
            <Text color={textColor} mb={2}>Your current plan details would be shown here.</Text>
            <Button
              variant="link"
              colorScheme="blue"
              onClick={() => navigate('/home')}
            >
              Manage Subscription on Home Page
            </Button>
          </CardBody>
        </Card>

        <Button colorScheme="blue" size="lg" onClick={handleSaveChanges} isLoading={isSaving} loadingText="Saving..." alignSelf="center">
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default ProfilePage;