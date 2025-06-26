import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api'; // Assuming auth service is still used
import api from '../services/api'; // Assuming api service is still used

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

  // Add these state variables after the existing state declarations
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

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
  const inputFocusBorderColor = useColorModeValue('blue.500', 'blue.300');
  const successIconColor = useColorModeValue('green.500', 'green.500');
  const warningIconColor = useColorModeValue('red.500', 'red.500');
  const successTextColor = useColorModeValue('green.500', 'green.500');
  const warningTextColor = useColorModeValue('red.500', 'red.500');

  const [isLoading, setIsLoading] = useState(true); // Add this line

  // Add this to your state declarations at the top of the component
  const [isDeleting, setIsDeleting] = useState(false);

  // Add this to the state declarations at the top of the component
  const [energyMotto, setEnergyMotto] = useState('');

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
          const response = await api.post('/auth/change-password', {
              oldPassword: String(oldPassword),
              newPassword: String(newPassword)
          });
          const data = response.data;

          if (data.success) {
              toast({
                  title: 'Password Updated',
                  description: 'Your password has been updated successfully.',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
              });
              setOldPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
              setPasswordChangeStatus({ status: 'success', message: 'Password updated successfully' });
          } else {
              throw new Error(data.message || 'Failed to change password');
          }
      } catch (error) {
          console.error('Password change error:', error);
           toast({
              title: 'Password Change Failed',
              description: error.response?.data?.message || 'There was an error changing your password. Please try again later.',
              status: 'error',
              duration: 5000,
              isClosable: true,
          });
          setPasswordChangeStatus({ status: 'error', message: 'Password change failed' });
      } finally {
          setPasswordChangeLoading(false);
           setTimeout(() => setPasswordChangeStatus(null), 5000);
      }
  };

  // Update handleSavePreferences
  const handleSavePreferences = async () => {
      setPreferencesSaving(true);
      setPreferencesStatus(null);
      try {
          const preferencesData = {
              receiveSms: Boolean(receiveSms),
              receiveEmail: Boolean(receiveEmail)
          };

          console.log('Saving preferences:', preferencesData); // Debug log
          const response = await api.put('/settings', preferencesData); // Remove /api prefix
          console.log('Save preferences response:', response.data); // Debug log

          if (response.data.success) {
              toast({
                  title: 'Preferences Saved',
                  description: 'Your notification preferences have been saved successfully.',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
              });
              setPreferencesStatus({ status: 'success', message: 'Preferences saved successfully' });
          } else {
              throw new Error(response.data.message || 'Failed to save preferences');
          }
      } catch (error) {
          console.error('Preferences save error:', error);
          console.error('Error details:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
          });
          toast({
              title: 'Error Occurred',
              description: error.response?.data?.message || 'Could not save preferences. Please try again.',
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

  // Update the useEffect for loading user data
  useEffect(() => {
      const loadUserData = async () => {
          if (!user || !isLoading) return; // Add this check
          
          try {
              setIsLoading(true);
              // Load settings
              console.log('Fetching settings...');
              const settingsResponse = await api.get('/settings');
              console.log('Settings response:', settingsResponse.data);
              
              if (settingsResponse.data.success) {
                  const settings = settingsResponse.data.settings;
                  setReceiveSms(settings.receiveSms);
                  setReceiveEmail(settings.receiveEmail);
              }

              // Load profile data
              console.log('Fetching profile...');
              const profileResponse = await api.get('/profile');
              console.log('Profile response:', profileResponse.data);
              
              if (profileResponse.data.success) {
                  const profile = profileResponse.data.profile;
                  setFullName(profile.full_name || '');
                  setPhone(profile.phone_number || '');
                  setAddress(profile.address || '');
                  setEnergyMotto(profile.energy_motto || '');
              }
          } catch (error) {
              console.error('Error loading user data:', error);
              console.error('Error details:', {
                  message: error.message,
                  response: error.response?.data,
                  status: error.response?.status,
                  headers: error.response?.headers
              });
              toast({
                  title: 'Error Loading Data',
                  description: 'Could not load your profile and preferences. Please try refreshing the page.',
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
              });
          } finally {
              setIsLoading(false);
          }
      };

      loadUserData();
  }, [user, isLoading, toast]);

  // Update handleSaveProfile
  const handleSaveProfile = async () => {
      setProfileSaving(true);
      setProfileStatus(null);
      try {
          const profileData = {
              full_name: fullName,
              email_address: user.email,
              phone_number: phone,
              address: address,
              energy_motto: energyMotto
          };

          console.log('Saving profile data:', profileData); // Debug log
          const response = await api.put('/profile', profileData);
          console.log('Save profile response:', response.data);
          
          if (response.data.success) {
              toast({
                  title: 'Profile Updated',
                  description: 'Your profile has been updated successfully.',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
              });
              setProfileStatus({ status: 'success', message: 'Profile updated successfully' });
          } else {
              throw new Error(response.data.message || 'Failed to update profile');
          }
      } catch (error) {
          console.error('Profile update error:', error);
          console.error('Error details:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
          });
          toast({
              title: 'Error Occurred',
              description: error.response?.data?.message || 'Could not update profile. Please try again.',
              status: 'error',
              duration: 5000,
              isClosable: true,
          });
          setProfileStatus({ status: 'error', message: 'Failed to update profile' });
      } finally {
          setProfileSaving(false);
          setTimeout(() => setProfileStatus(null), 5000);
      }
  };

  // Update handleDeleteAccount
  const handleDeleteAccount = async () => {
      setIsDeleting(true);
      try {
          // Call the delete account API
          const response = await api.post('/auth/delete-account');
          
          if (response.data.success) {
              // Clear all local storage
              localStorage.clear();
              
              // Show success message
              toast({
                  title: 'Account Deleted',
                  description: 'Your account has been successfully deleted.',
                  status: 'success',
                  duration: 5000,
                  isClosable: true,
              });
              
              // Close the confirmation modal
              onClose();
              
              // Redirect to landing page
              navigate('/');
          } else {
              throw new Error(response.data.message || 'Failed to delete account');
          }
      } catch (error) {
          console.error('Delete account error:', error);
          toast({
              title: 'Error',
              description: error.response?.data?.message || 'Failed to delete account. Please try again.',
              status: 'error',
              duration: 5000,
              isClosable: true,
          });
      } finally {
          setIsDeleting(false);
      }
  };


  // Render loading spinner while user is being checked or data is loading initially
  if (!user || isLoading) {
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
                            <Input type="email" value={user.email} isReadOnly borderColor={inputFocusBorderColor} />
                        </FormControl>
                        <FormControl id="fullName">
                            <FormLabel color={mutedTextColor}>Full Name</FormLabel>
                            <Input 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                focusBorderColor={inputFocusBorderColor}
                            />
                        </FormControl>
                        <FormControl id="phone">
                            <FormLabel color={mutedTextColor}>Phone Number</FormLabel>
                            <Input 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                focusBorderColor={inputFocusBorderColor}
                            />
                        </FormControl>
                        <FormControl id="address">
                            <FormLabel color={mutedTextColor}>Address</FormLabel>
                            <Input 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                focusBorderColor={inputFocusBorderColor}
                            />
                        </FormControl>
                        <FormControl id="energyMotto">
                            <FormLabel color={mutedTextColor}>Energy Motto</FormLabel>
                            <Input 
                                value={energyMotto}
                                onChange={(e) => setEnergyMotto(e.target.value)}
                                focusBorderColor={inputFocusBorderColor}
                                placeholder="Enter your energy motto or goal"
                            />
                        </FormControl>
                        <Button 
                            onClick={handleSaveProfile} 
                            isLoading={profileSaving} 
                            colorScheme="blue" 
                            alignSelf="flex-start"
                        >
                            Save Profile
                        </Button>
                        {profileStatus && (
                            <HStack>
                                <Icon
                                    as={profileStatus.status === 'success' ? CheckCircleIcon : WarningIcon}
                                    color={profileStatus.status === 'success' ? successIconColor : warningIconColor}
                                />
                                <Text 
                                    color={profileStatus.status === 'success' ? successTextColor : warningTextColor} 
                                    fontSize="sm"
                                >
                                    {profileStatus.message}
                                </Text>
                            </HStack>
                        )}
                         {user?.lastLogin && (
                            <Box>
                                <Text fontSize="sm" color={mutedTextColor}>
                                    Last Login: {formatLastLogin(user.lastLogin)}
                                </Text>
                            </Box>
                         )}
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
                         <FormControl display="flex" alignItems="center" justifyContent="space-between">
                             <FormLabel htmlFor="receive-sms" mb="0" color={mutedTextColor}>
                                 Receive SMS Notifications
                             </FormLabel>
                             <Switch 
                                 id="receive-sms" 
                                 isChecked={receiveSms} 
                                 onChange={(e) => setReceiveSms(e.target.checked)} 
                                 colorScheme="blue"
                             />
                         </FormControl>
                         <FormControl display="flex" alignItems="center" justifyContent="space-between">
                             <FormLabel htmlFor="receive-email" mb="0" color={mutedTextColor}>
                                 Receive Email Notifications
                             </FormLabel>
                             <Switch 
                                 id="receive-email" 
                                 isChecked={receiveEmail} 
                                 onChange={(e) => setReceiveEmail(e.target.checked)} 
                                 colorScheme="blue"
                             />
                         </FormControl>
                         <Button 
                             onClick={handleSavePreferences} 
                             isLoading={preferencesSaving} 
                             colorScheme="blue" 
                             alignSelf="flex-start"
                             mt={4}
                         >
                             Save Preferences
                         </Button>
                         {preferencesStatus && (
                             <HStack>
                                 <Icon
                                     as={preferencesStatus.status === 'success' ? CheckCircleIcon : WarningIcon}
                                     color={preferencesStatus.status === 'success' ? successIconColor : warningIconColor}
                                 />
                                 <Text 
                                     color={preferencesStatus.status === 'success' ? successTextColor : warningTextColor} 
                                     fontSize="sm"
                                 >
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
                    All your data, including profile information, preferences, and transaction history will be permanently deleted.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        colorScheme="red" 
                        onClick={handleDeleteAccount} 
                        ml={3}
                        isLoading={isDeleting} // Add this state
                    >
                        Delete Account
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