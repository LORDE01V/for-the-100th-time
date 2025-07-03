import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service is still used

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
  HStack,
  useToast,
  useColorModeValue,
  Spinner,
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

// Import icons - Added FaArrowLeft import here
import { FaArrowLeft } from 'react-icons/fa';


function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();

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


  // State and hooks for Delete Account Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(); // Ref for the cancel button


  const user = auth.getCurrentUser(); // Get current user data

  // Chakra UI hook for dynamic colors based on color mode - Defined at the top level
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600'); // Added border color
  // Added glassmorphism border color definition
  const glassBorderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  const glassBgColor = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(26, 32, 44, 0.15)');
  const glassBoxShadow = useColorModeValue('0 4px 6px rgba(0, 0, 0, 0.1)', '0 4px 6px rgba(0, 0, 0, 0.4)');

  // Define colors for conditionally rendered elements and input focus borders at the top level
  const inputFocusBorderColor = useColorModeValue('blue.500', 'blue.300'); // For all inputs
  const successIconColor = useColorModeValue('green.500', 'green.500'); // Assuming green is consistent
  const warningIconColor = useColorModeValue('red.500', 'red.500'); // Assuming red is consistent
  const successTextColor = useColorModeValue('green.500', 'green.500'); // Assuming green is consistent
  const warningTextColor = useColorModeValue('red.500', 'red.500'); // Assuming red is consistent


  // Redirect if user is not logged in
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


  // Handle Password Change Submission (Mock API call)
  const handleChangePassword = async (e) => {
      e.preventDefault();
      setPasswordErrors({}); // Clear previous errors
      setPasswordChangeStatus(null); // Clear previous status

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
          // --- MOCK API CALL FOR CHANGE PASSWORD ---
          console.log('Attempting to change password:', { oldPassword, newPassword });
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

          // Simulate success or failure
          const success = true; // Change to false to test error

          if (success) {
              toast({
                  title: 'Password Updated',
                  description: 'Your password has been updated successfully.',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
              });
              // Clear form fields on success
              setOldPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
              setPasswordChangeStatus({ status: 'success', message: 'Password updated successfully' });
          } else {
               toast({
                  title: 'Password Change Failed',
                  description: 'There was an error changing your password. Please try again later.',
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
              });
              setPasswordChangeStatus({ status: 'error', message: 'Password change failed' });
          }

      } catch (error) {
          console.error('Password change error:', error);
           toast({
              title: 'Error Occurred',
              description: error.message || 'Could not change password',
              status: 'error',
              duration: 5000,
              isClosable: true,
          });
          setPasswordChangeStatus({ status: 'error', message: 'An error occurred' });
      } finally {
          setPasswordChangeLoading(false);
           // Hide status message after a few seconds
           setTimeout(() => setPasswordChangeStatus(null), 5000);
      }
  };

  // Handle Preferences Save (Mock API call)
   const handleSavePreferences = async () => {
       setPreferencesSaving(true);
       setPreferencesStatus(null); // Clear previous status
       try {
           // --- MOCK API CALL FOR SAVING PREFERENCES ---
           console.log('Saving preferences:', { receiveSms, receiveEmail });

           await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

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
           // Hide status message after a few seconds
           setTimeout(() => setPreferencesStatus(null), 5000);
       }
   };


  // Handle Delete Account
  const handleDeleteAccount = async () => {
      // --- MOCK DELETE ACCOUNT PROCESS ---
      console.log('Deleting account for user:', user?.email);
      // In a real app: Call delete API, then clear auth token and redirect

      onClose(); // Close the confirmation modal
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      auth.logout(); // Clear auth token (assuming this clears localStorage)
       toast({
           title: 'Account Deleted',
           description: 'Your account has been deleted successfully.',
           status: 'success',
           duration: 3000,
           isClosable: true,
       });
      navigate('/login'); // Redirect to login page
      // --- END MOCK PROCESS ---
  };


  // Render loading spinner while user is being checked or data is loading initially
  if (!user) {
       return (
           <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
               <Spinner size="xl" color={spinnerColor} />
           </Flex>
       );
   }

  return (
    // Applied background gradient and overlay to the outermost Box
    <Box
      minH="100vh" // Ensure this Box takes the full viewport height
      backgroundImage="linear-gradient(to bottom right, #FF8C42, #4A00E0)" // Gradient matching login page
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
        {/* Content Box with glassmorphism */}
        <Box
            maxW="container.lg"
            mx="auto"
            p={{ base: 4, md: 6 }}
            position="relative"
            zIndex={2} // Ensure content is above the overlay
            bg={glassBgColor} // Glassmorphism background
            borderRadius="lg" // Rounded corners for glassmorphism box
            backdropFilter="blur(10px)" // Apply blur effect for glassmorphism
            borderWidth="1px" // Optional: Add a subtle border
            borderColor={glassBorderColor} // Use the defined glassmorphism border color
            boxShadow={glassBoxShadow} // Optional: Add shadow
            mt={8} // Add some margin top to separate from the top edge if needed
            mb={8} // Add some margin bottom
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
                <Box>
                    <Heading as="h2" size="lg" mb={4} color={headingColor}>General Information</Heading>
                    <Text color={mutedTextColor} mb={4}>Review and update your profile details.</Text>
                    <VStack spacing={4} align="stretch">
                        <FormControl id="email">
                            <FormLabel color={mutedTextColor}>Email Address</FormLabel>
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
                <Box>
                    <Heading as="h2" size="lg" mb={4} color={headingColor}>Change Password</Heading>
                    <Text color={mutedTextColor} mb={4}>Update your account password.</Text>
                    <VStack spacing={4} as="form" onSubmit={handleChangePassword}>
                         <FormControl id="old-password" isInvalid={passwordErrors.oldPassword}>
                              <FormLabel color={mutedTextColor}>Old Password</FormLabel>
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
                              <FormLabel color={mutedTextColor}>New Password</FormLabel>
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
                              <FormLabel color={mutedTextColor}>Confirm New Password</FormLabel>
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
                 <Box>
                     <Heading as="h2" size="lg" mb={4} color={headingColor}>Notification Preferences</Heading>
                     <Text color={mutedTextColor} mb={4}>Choose how you want to receive notifications.</Text>
                     <VStack spacing={4} align="stretch">
                         <HStack justify="space-between">
                             <FormLabel htmlFor="receive-sms" mb="0" color={mutedTextColor}>
                                 Receive SMS Notifications
                             </FormLabel>
                             <Switch id="receive-sms" isChecked={receiveSms} onChange={(e) => setReceiveSms(e.target.checked)} colorScheme="blue" />
                         </HStack>
                         <HStack justify="space-between">
                             <FormLabel htmlFor="receive-email" mb="0" color={mutedTextColor}>
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
                <Box>
                    <Heading as="h2" size="lg" mb={4} color={headingColor}>Danger Zone</Heading>
                    <Text color="red.400" mb={4}>Deleting your account is irreversible.</Text>
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