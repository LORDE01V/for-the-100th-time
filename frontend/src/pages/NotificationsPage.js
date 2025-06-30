import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import api from '../services/api';

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

function NotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const user = auth.getCurrentUser();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        if (response.data.success) {
          setNotifications(response.data.notifications.map(notif => ({
            id: notif.id,
            status: notif.type,
            title: notif.title,
            description: notif.message,
            isDismissed: notif.is_read
          })));
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch notifications',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user, toast]);

  const handleDismissNotification = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, isDismissed: true } : notif
      ));
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss notification',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
      <Container maxW="container.md" position="relative" zIndex={2} py={8}>
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

        {isLoading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <Stack spacing={4}>
            {activeNotifications.length > 0 ? (
              activeNotifications.map((notif) => (
                <Alert
                  key={notif.id}
                  status={notif.status}
                  variant="left-accent"
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
        )}
      </Container>
    </Box>
  );
}

export default NotificationsPage;
