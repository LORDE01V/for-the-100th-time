import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { auth } from '../services/api'; // Import api

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

// Helper to map backend data to frontend format
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

function NotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  
  // State to hold user, notifications, and loading status
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'rgba(0, 0, 0, 0.6)');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const cardColor = useColorModeValue('gray.800', 'white');

  // Set user once on component mount to prevent loops
  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } else {
      setUser(currentUser);
    }
  }, [navigate, toast]);

  // Fetch notifications from the API when the user is available
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    api.get('/api/user/notifications', { params: { user_id: user.id } })
      .then(response => {
        const mappedNotifications = response.data.notifications.map(mapNotification);
        setNotifications(mappedNotifications);
      })
      .catch(error => {
        toast({
          title: 'Failed to fetch notifications',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, toast]);

  const handleDismissNotification = (id) => {
    // This is a client-side dismiss only. For persistence, you'd call an API here.
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isDismissed: true } : notif
    ));
  };

  const activeNotifications = notifications.filter(notif => !notif.isDismissed);

  if (loading || !user) {
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

        <Box
          bg={cardBg}
          boxShadow="xl"
          borderRadius="xl"
          p={8}
          position="relative"
          zIndex={2}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={cardBorderColor}
          color={cardColor}
        >
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
                  pr={10}
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
        </Box>

      </Container>
    </Box>
  );
}

export default NotificationsPage;