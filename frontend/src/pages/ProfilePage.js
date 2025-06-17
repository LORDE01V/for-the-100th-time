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
  Textarea,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  HStack, // This line is essential for the HStack component to be defined
  Select,
  Divider,
  Icon,
} from '@chakra-ui/react';

// Import icons
// Added import for FaArrowLeft from react-icons/fa
import { FaArrowLeft } from 'react-icons/fa';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

// Define API base URL constant
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();

  // State for form fields
  const [profileData, setProfileData] = useState({
    full_name: '',
    email_address: '',
    phone_number: '',
    address: '',
    energy_motto: '',
    social_accounts: {
      facebook_profile_url: '',
      twitter_profile_url: '',
      instagram_profile_url: ''
    }
  });
  console.log('Initial profileData state:', profileData);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // Loading state for saving account changes

  // Add new state for payment methods
  const [paymentMethods, setPaymentMethods] = useState({
    type: '',
    cardNumber: '',
    expiryDate: '',
    cardHolderName: '',
    isDefault: false
  });

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

  const [socialAccountsStatus, setSocialAccountsStatus] = useState(null);

  // Add a loading state
  const [isLoading, setIsLoading] = useState(true);

  // Modify the useEffect to only fetch data once on mount
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

    fetchProfileData();
  }, [user, navigate, toast]); // Only depend on user, navigate, and toast

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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setProfileStatus(null);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/profile`,
        {
          ...profileData,
          social_accounts: {
            facebook_profile_url: profileData.social_accounts.facebook_profile_url || '',
            twitter_profile_url: profileData.social_accounts.twitter_profile_url || '',
            instagram_profile_url: profileData.social_accounts.instagram_profile_url || ''
          }
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      // Optional: Display a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profilePictureUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
       setProfilePictureFile(null);
       // Optional: Revert to previous image if file selection is cancelled
      //  setProfileData(prev => ({ ...prev, profilePictureUrl: user?.profilePictureUrl || null }));
    }
  };

  // Add handler for payment method changes
  const handlePaymentMethodChange = (e) => {
    const { name, value } = e.target;
    setPaymentMethods(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add this validation function
  const validatePaymentMethod = () => {
    const errors = {};
    
    if (!paymentMethods.type) {
      errors.type = 'Payment type is required';
    }
    
    if (!paymentMethods.cardNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentMethods.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Invalid card number (must be 16 digits)';
    }
    
    if (!paymentMethods.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentMethods.expiryDate)) {
      errors.expiryDate = 'Invalid expiry date (MM/YY)';
    }
    
    if (!paymentMethods.cardHolderName) {
      errors.cardHolderName = 'Card holder name is required';
    }
    
    return errors;
  };

  // Update the handleSavePaymentMethod function with more detailed logging
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
      // Log the exact data being sent
      console.log('Sending payment method data:', {
        type: paymentMethods.type,
        cardNumber: paymentMethods.cardNumber,
        expiryDate: paymentMethods.expiryDate,
        cardHolderName: paymentMethods.cardHolderName,
        isDefault: paymentMethods.isDefault
      });

      // Log the API URL and headers
      console.log('API URL:', `${API_BASE_URL}/api/payment-methods`);
      console.log('Auth Token:', auth.getToken());

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

      console.log('Server response:', response.data);

      if (response.data.success) {
        toast({
          title: 'Payment method saved.',
          description: 'Your payment method has been saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Reset form
        setPaymentMethods({
          type: '',
          cardNumber: '',
          expiryDate: '',
          cardHolderName: '',
          isDefault: false
        });
      }
    } catch (error) {
      // Detailed error logging
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
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

  const handleSocialInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      social_accounts: {
        ...prev.social_accounts,
        [`${name}_profile_url`]: value
      }
    }));
  };

  if (!user) {
    return (
      // This Flex uses bgColor for the background when loading
      <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" color={spinnerColor} />
      </Flex>
    );
  }

  return (
    // Locate the outermost container that renders when the user is loaded (likely a Box around line 291 in the provided code):
    // Apply the background gradient and overlay to this Box:
    <Box
      minH="100vh" // Ensure this Box takes the full viewport height
      backgroundImage="linear-gradient(to bottom right, #FF8C42, #4A00E0)" // Example gradient (adjust colors)
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundAttachment="fixed" // Fixed background
      position="relative" // Needed for absolute positioning of overlay
      _before={{ // Add an overlay for readability
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'rgba(0, 0, 0, 0.5)', // Dark overlay with 50% opacity (adjust as needed)
          zIndex: 1, // Ensure this is lower than the content Box's zIndex
      }}
    >
      <Box maxW="container.lg" mx="auto" p={{ base: 4, md: 6 }} position="relative" zIndex={2}> {/* Keep this Box for content centering and padding */}

        {/* Header */}
        <HStack justify="space-between" align="center" mb={8}> {/* Added align="center" for vertical alignment */}
          {/* Changed from ReactRouterLink to Button with onClick navigation to /home */}
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

        <VStack spacing={8} align="stretch"> {/* Increased spacing between sections */}

           {/* Profile Picture Section */}
           <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
             <CardHeader>
               <Heading size="md">Profile Picture</Heading>
             </CardHeader>
             <CardBody>
               <VStack spacing={4} align="center">
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

           {/* Account Settings Section */}
           <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
             <CardHeader>
               <Heading size="md">Account Information</Heading>
             </CardHeader>
             <CardBody>
               <VStack spacing={4} as="form">
                 <FormControl id="full_name">
                   <FormLabel>Full Name</FormLabel>
                   <Input
                     name="full_name"
                     value={profileData.full_name}
                     onChange={handleInputChange}
                     bg={inputBgColor}
                     borderColor={inputBorderColor}
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
                     placeholder="No energy motto set"
                   />
                 </FormControl>
               </VStack>
             </CardBody>
           </Card>

           {/* Social Accounts Section */}
           <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
             <CardHeader>
               <Heading size="md">Linked Accounts</Heading>
             </CardHeader>
             <CardBody>
               <VStack spacing={4}>
                 <FormControl id="facebook">
                   <FormLabel color={mutedTextColor}>Facebook Profile URL</FormLabel>
                   <Input
                     name="facebook"
                     value={profileData.social_accounts.facebook_profile_url || ''}
                     onChange={handleSocialInputChange}
                     bg={inputBgColor}
                     borderColor={inputBorderColor}
                     focusBorderColor={inputFocusBorderColor}
                     placeholder="Enter your Facebook profile URL"
                   />
                 </FormControl>
                 <FormControl id="twitter">
                   <FormLabel color={mutedTextColor}>Twitter Profile URL</FormLabel>
                   <Input
                     name="twitter"
                     value={profileData.social_accounts.twitter_profile_url || ''}
                     onChange={handleSocialInputChange}
                     bg={inputBgColor}
                     borderColor={inputBorderColor}
                     focusBorderColor={inputFocusBorderColor}
                     placeholder="Enter your Twitter profile URL"
                   />
                 </FormControl>
                 <FormControl id="instagram">
                   <FormLabel color={mutedTextColor}>Instagram Profile URL</FormLabel>
                   <Input
                     name="instagram"
                     value={profileData.social_accounts.instagram_profile_url || ''}
                     onChange={handleSocialInputChange}
                     bg={inputBgColor}
                     borderColor={inputBorderColor}
                     focusBorderColor={inputFocusBorderColor}
                     placeholder="Enter your Instagram profile URL"
                   />
                 </FormControl>
               </VStack>
             </CardBody>
           </Card>

           {/* Saved Payment Methods Section */}
           <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
             <CardHeader>
               <Heading size="md">Saved Payment Methods</Heading>
             </CardHeader>
             <CardBody>
               <VStack spacing={4}>
                 <FormControl id="paymentType">
                   <FormLabel>Payment Type</FormLabel>
                   <Select
                     name="type"
                     value={paymentMethods.type}
                     onChange={handlePaymentMethodChange}
                     placeholder="Select payment type"
                     bg={inputBgColor}
                     borderColor={inputBorderColor}
                   >
                     <option value="credit_card">Credit Card</option>
                     <option value="debit_card">Debit Card</option>
                     <option value="bank_transfer">Bank Transfer</option>
                     <option value="e_wallet">E-Wallet</option>
                   </Select>
                 </FormControl>

                 {paymentMethods.type && (
                   <>
                     <FormControl id="cardNumber">
                       <FormLabel>Card Number</FormLabel>
                       <Input
                         name="cardNumber"
                         value={paymentMethods.cardNumber}
                         onChange={handlePaymentMethodChange}
                         placeholder="Enter card number"
                         bg={inputBgColor}
                         borderColor={inputBorderColor}
                       />
                     </FormControl>

                     <FormControl id="expiryDate">
                       <FormLabel>Expiry Date</FormLabel>
                       <Input
                         name="expiryDate"
                         value={paymentMethods.expiryDate}
                         onChange={handlePaymentMethodChange}
                         placeholder="MM/YY"
                         bg={inputBgColor}
                         borderColor={inputBorderColor}
                       />
                     </FormControl>

                     <FormControl id="cardHolderName">
                       <FormLabel>Card Holder Name</FormLabel>
                       <Input
                         name="cardHolderName"
                         value={paymentMethods.cardHolderName}
                         onChange={handlePaymentMethodChange}
                         placeholder="Enter card holder name"
                         bg={inputBgColor}
                         borderColor={inputBorderColor}
                       />
                     </FormControl>

                     <Button
                       colorScheme="blue"
                       onClick={handleSavePaymentMethod}
                       isLoading={isSaving}
                       loadingText="Saving..."
                       width="full"
                     >
                       Save Payment Method
                     </Button>
                   </>
                 )}
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

           {/* Save Changes Button */}
           <Button
             colorScheme="blue"
             size="lg"
             onClick={handleSaveChanges}
             isLoading={isSaving}
             loadingText="Saving..."
             alignSelf="center"
           >
             Save Changes
           </Button>

        </VStack>
      </Box>
    </Box>
  );
}

export default ProfilePage;