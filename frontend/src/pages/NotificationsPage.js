import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

// Import Chakra UI Components
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  useColorModeValue,
  useToast,
  Spinner,
  Container,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  HStack
} from '@chakra-ui/react';

// Import Icons
import { FaArrowLeft } from 'react-icons/fa';

import notificationBackground from '../assets/images/notification.png';

function NotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = auth.getCurrentUser();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Dummy notification data
  const [notifications, setNotifications] = useState([
    { id: 1, status: 'warning', title: 'Low Balance', description: 'Your energy credit is running low. Top up soon!', isDismissed: false },
    { id: 2, status: 'info', title: 'System Update', description: 'Scheduled maintenance tonight at 2 AM.', isDismissed: false },
    { id: 3, status: 'success', title: 'Top-Up Successful', description: 'Your R200 top-up was successful.', isDismissed: false },
    { id: 4, status: 'error', title: 'Payment Failed', description: 'Your recent payment failed. Please check your details.', isDismissed: false },
  ]);

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

  const handleDismissNotification = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isDismissed: true } : notif
    ));
  };

  const activeNotifications = notifications.filter(notif => !notif.isDismissed);

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      backgroundImage={`url(${notificationBackground})`}
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
          Notifications
        </Heading>

        <Stack spacing={4}>
          {activeNotifications.length > 0 ? (
            activeNotifications.map((notif) => (
              <Alert
                key={notif.id}
                status={notif.status}
                variant="left-accent"
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(10px)"
                border="1px solid rgba(255, 255, 255, 0.2)"
                pr={10} // Add padding to the right to make space for the close button
              >
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle mt={-1} mb={1} fontSize="md">{notif.title}</AlertTitle>
                  <AlertDescription display="block">{notif.description}</AlertDescription>
                </Box>
                <CloseButton
                  position="absolute"
                  right="8px"
                  top="8px"
                  onClick={() => handleDismissNotification(notif.id)}
                />
              </Alert>
            ))
          ) : (
            <Text textAlign="center" mt={8} color={textColor}>No new notifications.</Text>
          )}
        </Stack>

      </Container>
    </Box>
  );
}

export default NotificationsPage;
