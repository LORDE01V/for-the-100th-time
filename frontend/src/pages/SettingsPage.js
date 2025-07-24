import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service is still used
import api from '../services/api';
// Import Chakra UI Components
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Divider,
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  FormErrorMessage,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
//import { mapNotification } from './NotificationsPage'; // Adjust the path as needed


// Import icons - Added FaArrowLeft import here
import { FaArrowLeft } from 'react-icons/fa';
import settingsBackground from '../assets/images/Settings_page.png';  // Added: Import the image for proper bundling


function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Move all useColorModeValue calls to the top level
  const headingColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputFocusBorderColor = useColorModeValue('blue.500', 'blue.300');
  const successIconColor = useColorModeValue('green.500', 'green.500');
  const warningIconColor = useColorModeValue('red.500', 'red.500');
  const successTextColor = useColorModeValue('green.500', 'green.500');
  const warningTextColor = useColorModeValue('red.500', 'red.500');

  const user = auth.getCurrentUser();

  // State for Account Settings (Change Password)
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);

  // State for Preferences
  const [receiveSms, setReceiveSms] = useState(true); // Default notification preference
  const [receiveEmail, setReceiveEmail] = useState(true); // Default notification preference
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesStatus, setPreferencesStatus] = useState(null);


  // Redirect if user is not logged in (this handles the logic)
  useEffect(() => {
      if (!user) {
          navigate('/login');
          toast({
               title: 'Authentication Required',
               description: 'You need to be logged in to access this page.',
               status: 'warning',
               duration: 3000,
               isClosable: true,
          });
      }
  }, [user, navigate, toast]);

  // Helper to format last login date (if user object includes it)
  const formatLastLogin = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          const date = new Date(dateString);
          return date.toLocaleString();
      } catch (error) {
          console.error("Error formatting date:", error);
          return dateString;
      }
  };
  
 

// Define mapNotification locally
const mapNotification = (notif) => {
    const message = notif.message.toLowerCase();
    let status = 'info'; // Default status
    if (message.includes('expense') || message.includes('success') || message.includes('top-up')) {
        status = 'success';
    } else if (message.includes('low balance')) {
        status = 'warning';
    } else if (message.includes('failed')) {
        status = 'error';
    }

    return {
        id: notif.id,
        status: status,
        title: notif.title || 'New Notification', // Use a title from backend or a default
        description: notif.message,
        isDismissed: notif.is_read || false,
        created_at: notif.created_at,
    };
};

const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordChangeStatus(null);

    // Basic validation
    const errors = {};
    if (!oldPassword) errors.oldPassword = 'Old password is required';
    if (!newPassword) {
        errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
        errors.newPassword = 'New password must be at least 6 characters long';
    }
    if (!confirmNewPassword) {
        errors.confirmNewPassword = 'Confirm new password is required';
    } else if (newPassword !== confirmNewPassword) {
        errors.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
        setPasswordErrors(errors);
        setPasswordChangeStatus({ status: 'error', message: 'Please fix the errors above' });
        return;
    }

    setPasswordChangeLoading(true);

    try {
        const requestData = {
            old_password: oldPassword,
            new_password: newPassword,
        };
        console.log('Request Data:', requestData); // Log the request data

        await api.post('/api/auth/change-password', requestData);

        toast({
            title: 'Password Updated',
            description: 'Your password has been updated successfully.',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });

        // Trigger re-fetch of notifications
        const response = await api.get('/api/user/notifications', { params: { user_id: auth.getCurrentUser().id } });
        const mappedNotifications = response.data.notifications.map(mapNotification);
        console.log('Fetched Notifications:', mappedNotifications); // Log notifications for debugging

        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordChangeStatus({ status: 'success', message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error Response:', error.response?.data); // Log the error response
        toast({
            title: 'Password Change Failed',
            description: error.response?.data?.message || error.message || 'There was an error changing your password.',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        setPasswordChangeStatus({ status: 'error', message: error.response?.data?.message || 'Password change failed' });
    } finally {
        setPasswordChangeLoading(false);
        setTimeout(() => setPasswordChangeStatus(null), 5000);
    }
};

useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await api.get('/notifications/preferences');
        setReceiveSms(response.data.receiveSms);
        setReceiveEmail(response.data.receiveEmail);
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };
    fetchPreferences();
  }, []);

  // Handle Preferences Save (Mock API call)
  const handleSavePreferences = async () => {
    setPreferencesSaving(true);
    setPreferencesStatus(null); // Clear previous status
    try {
      await api.post('/notifications/preferences', {
        receiveSms,
        receiveEmail,
      });
      toast({
        title: 'Preferences Saved',
        description: 'Your preferences have been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setPreferencesStatus({ status: 'success', message: 'Preferences saved successfully' });
    } catch (error) {
      console.error('Preferences save error:', error);
      toast({
        title: 'Error Occurred',
        description: error.message || 'Could not save preferences',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setPreferencesStatus({ status: 'error', message: 'Failed to save preferences' });
    } finally {
      setPreferencesSaving(false);
      setTimeout(() => setPreferencesStatus(null), 5000);
    }
  };


  // Handle Delete Account
 
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      // Assumes JWT is sent via Authorization header or cookie
      await api.delete('/api/auth/delete-account');
      // Clear user state (context, localStorage, etc.)
      localStorage.clear();
      // Redirect to landing page
      navigate('/');
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    }
  };



  // Render loading spinner while user is being checked or data is loading initially
  return (
    // Applied background gradient and overlay to the outermost Box
    <Box
      minH="100vh" // Ensure this Box takes the full viewport height
      backgroundImage={`url(${settingsBackground})`}  // Updated: Use the imported image
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
          bg: 'rgba(0, 0, 0, 0.5)', // Dark overlay with 50% opacity (adjust as needed)
          zIndex: 1, // Ensure this is lower than the content Box's zIndex
      }}
    >
        {/* Content Box with glassmorphism */}
        <Box
            maxW="container.lg"
            mx="auto"
            p={{ base: 4, md: 6 }}
            position="relative"
            zIndex={2} // Ensure content is above the overlay
            bg={useColorModeValue('white', 'rgba(0, 0, 0, 0.6)')}
            boxShadow="xl"
            borderRadius="xl"
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
            color={useColorModeValue('gray.800', 'white')}
            mt={8}
            mb={8}
        >
            {/* Header with Back to Dashboard Button */}
            <HStack justify="space-between" align="center" mb={8}>
                {/* Using the imported FaArrowLeft icon */}
                <Button leftIcon={<FaArrowLeft />} variant="ghost" onClick={() => navigate('/home')} color={headingColor}>
                    Back to Home
                </Button>
                {/* You can add other header elements here if needed */}
            </HStack>

            <Heading as="h1" size="xl" color={headingColor} mb={8}>
                Account Settings
            </Heading>

            <VStack spacing={8} align="stretch">

                {/* General Information Section */}
                <Box
                    p={4}
                    bg={useColorModeValue('white', 'rgba(0, 0, 0, 0.6)')}
                    boxShadow="xl"
                    borderRadius="xl"
                    backdropFilter="blur(16px)"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    color={useColorModeValue('gray.800', 'white')}
                >
                    <Heading as="h2" size="lg" mb={4}>General Information</Heading>
                    <Text color={mutedTextColor} mb={4}>Review and update your account details.</Text>
                    <VStack spacing={4} align="stretch">
                        <FormControl id="email">
                            <FormLabel color={headingColor}>Email Address</FormLabel>
                            {/* Using the defined inputFocusBorderColor */}
                            <Input type="email" value={user?.email} isReadOnly focusBorderColor={inputFocusBorderColor} /> {/* Email is usually not changeable here */}
                        </FormControl>
                        {/* Display last login if available */}
                         {user?.lastLogin && (
                            <Box>
                                <Text fontSize="sm" color={mutedTextColor}>Last Login: {formatLastLogin(user.lastLogin)}</Text>
                            </Box>
                         )}
                        {/* You can add more general user info fields here if your user object has them */}
                    </VStack>
                </Box>

                <Divider borderColor={borderColor} /> {/* Add a divider */}

                {/* Change Password Section */}
                <Box
                    p={4}
                    bg={useColorModeValue('white', 'rgba(0, 0, 0, 0.6)')}
                    boxShadow="xl"
                    borderRadius="xl"
                    backdropFilter="blur(16px)"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    color={useColorModeValue('gray.800', 'white')}
                >
                    <Heading as="h2" size="lg" mb={4}>Change Password</Heading>
                    <Text color={mutedTextColor} mb={4}>Update your account password.</Text>
                    <VStack spacing={4} as="form" onSubmit={handleChangePassword}>
                         <FormControl id="old-password" isInvalid={passwordErrors.oldPassword}>
                              <FormLabel color={headingColor}>Old Password</FormLabel>
                               {/* Using the defined inputFocusBorderColor */}
                       <Input
                         type="password"
                         value={oldPassword}
                         onChange={(e) => setOldPassword(e.target.value)}
                                   focusBorderColor={inputFocusBorderColor}
                       />
                       <FormErrorMessage>{passwordErrors.oldPassword}</FormErrorMessage>
                     </FormControl>
                         <FormControl id="new-password" isInvalid={passwordErrors.newPassword}>
                              <FormLabel color={headingColor}>New Password</FormLabel>
                               {/* Using the defined inputFocusBorderColor */}
                       <Input
                         type="password"
                         value={newPassword}
                         onChange={(e) => setNewPassword(e.target.value)}
                                   focusBorderColor={inputFocusBorderColor}
                       />
                       <FormErrorMessage>{passwordErrors.newPassword}</FormErrorMessage>
                     </FormControl>
                         <FormControl id="confirm-new-password" isInvalid={passwordErrors.confirmNewPassword}>
                              <FormLabel color={headingColor}>Confirm New Password</FormLabel>
                               {/* Using the defined inputFocusBorderColor */}
                       <Input
                         type="password"
                         value={confirmNewPassword}
                         onChange={(e) => setConfirmNewPassword(e.target.value)}
                                   focusBorderColor={inputFocusBorderColor}
                       />
                       <FormErrorMessage>{passwordErrors.confirmNewPassword}</FormErrorMessage>
                     </FormControl>
                         <Button type="submit" colorScheme="blue" isLoading={passwordChangeLoading}>
                       Change Password
                     </Button>
                         {passwordChangeStatus && (
                             <HStack>
                                  {/* Using the defined successIconColor and warningIconColor */}
                                  <Icon
                                      as={passwordChangeStatus.status === 'success' ? CheckCircleIcon : WarningIcon}
                                       color={passwordChangeStatus.status === 'success' ? successIconColor : warningIconColor}
                                  />
                                   {/* Using the defined successTextColor and warningTextColor */}
                                  <Text color={passwordChangeStatus.status === 'success' ? successTextColor : warningTextColor} fontSize="sm">
                                      {passwordChangeStatus.message}
                                  </Text>
                             </HStack>
                         )}
                </VStack>
            </Box>

                 <Divider borderColor={borderColor} /> {/* Add another divider */}

                 {/* Notification Preferences Section */}
                 <Box
                    p={4}
                    bg={useColorModeValue('white', 'rgba(0, 0, 0, 0.6)')}
                    boxShadow="xl"
                    borderRadius="xl"
                    backdropFilter="blur(16px)"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    color={useColorModeValue('gray.800', 'white')}
                 >
                     <Heading as="h2" size="lg" mb={4}>Notification Preferences</Heading>
                     <Text color={mutedTextColor} mb={4}>Choose how you want to receive notifications.</Text>
                     <VStack spacing={4} align="stretch">
                         <HStack justify="space-between">
                             <FormLabel htmlFor="receive-sms" mb="0" color={headingColor}>
                                 Receive SMS Notifications
                             </FormLabel>
                             <Switch id="receive-sms" isChecked={receiveSms} onChange={(e) => setReceiveSms(e.target.checked)} colorScheme="blue" />
                         </HStack>
                         <HStack justify="space-between">
                             <FormLabel htmlFor="receive-email" mb="0" color={headingColor}>
                                 Receive Email Notifications
                             </FormLabel>
                             <Switch id="receive-email" isChecked={receiveEmail} onChange={(e) => setReceiveEmail(e.target.checked)} colorScheme="blue" />
                         </HStack>
                         <Button onClick={handleSavePreferences} isLoading={preferencesSaving} colorScheme="blue" alignSelf="flex-start">
                             Save Preferences
                         </Button>
                     {preferencesStatus && (
                              <HStack>
                                   {/* Using the defined successIconColor and warningIconColor */}
                            <Icon
                                as={preferencesStatus.status === 'success' ? CheckCircleIcon : WarningIcon}
                                       color={preferencesStatus.status === 'success' ? successIconColor : warningIconColor}
                                  />
                                   {/* Using the defined successTextColor and warningTextColor */}
                                  <Text color={preferencesStatus.status === 'success' ? successTextColor : warningTextColor} fontSize="sm">
                                      {preferencesStatus.message}
                                  </Text>
                              </HStack>
                          )}
                </VStack>
            </Box>


                <Divider borderColor={borderColor} /> {/* Add another divider */}

                {/* Delete Account Section */}
                <Box
                    p={4}
                    bg={useColorModeValue('white', 'rgba(0, 0, 0, 0.6)')}
                    boxShadow="xl"
                    borderRadius="xl"
                    backdropFilter="blur(16px)"
                    border="1px solid"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    color={useColorModeValue('gray.800', 'white')}
                >
                    <Heading as="h2" size="lg" mb={4}>Danger Zone</Heading>
                    <Text color={warningTextColor} mb={4}>Deleting your account is irreversible.</Text>
                    <Button colorScheme="red" onClick={onOpen}>
                        Delete Account
                 </Button>

            {/* Delete Account Confirmation Modal */}
             <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
             >
                <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                    Delete Account
                    </AlertDialogHeader>

                    <AlertDialogBody>
                    Are you sure you want to delete your account? This action cannot be undone.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>
                        Delete
                    </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialogOverlay>
             </AlertDialog>
                </Box>

            </VStack>
        </Box>
    </Box>
  );
}

export default SettingsPage;