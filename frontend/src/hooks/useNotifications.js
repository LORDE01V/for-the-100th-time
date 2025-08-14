import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import notificationService from '../services/notificationService';

export const useNotifications = (user = null) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Set up event listeners and check status ONCE on mount
  useEffect(() => {
    let mounted = true;
    // Check notification status
    const checkStatus = async () => {
      try {
        setLoading(true);
        const permissionStatus = await notificationService.checkPermissionStatus();
        if (mounted) {
          setPermission((prev) => prev !== permissionStatus ? permissionStatus : prev);
        }
        if (permissionStatus === 'granted') {
          const subscribed = await notificationService.isSubscribed();
          if (mounted) {
            setIsSubscribed((prev) => prev !== subscribed ? subscribed : prev);
          }
        }
      } catch (error) {
        console.error('Error checking notification status:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    checkStatus();

    // Listen for subscription changes
    notificationService.onSubscriptionChange((newSubscribed) => {
      setIsSubscribed((prev) => prev !== newSubscribed ? newSubscribed : prev);
      if (newSubscribed) {
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    });
    // Listen for notification clicks
    notificationService.onNotificationClick((event) => {
      if (event.data && event.data.url) {
        window.location.href = event.data.url;
      }
    });
    // Listen for notification display
    notificationService.onNotificationDisplay((event) => {
      // No-op
    });
    return () => { mounted = false; };
  }, []); // Only once on mount

  const enableNotifications = async () => {
    try {
      setLoading(true);
      // Check if notifications are supported
      const permissionStatus = await notificationService.checkPermissionStatus();
      if (permissionStatus === 'unsupported') {
        throw new Error('Your browser does not support push notifications.');
      }
      if (permissionStatus === 'granted') {
        const subscribed = await notificationService.isSubscribed();
        if (subscribed) {
          setIsSubscribed((prev) => prev !== true ? true : prev);
          return { success: true, message: 'Push notifications are already enabled.' };
        }
      }
      // Request permission and show prompt
      await notificationService.requestPermission();
      // Set user information if available
      if (user && user.email) {
        await notificationService.setExternalUserId(user.email);
        await notificationService.sendTags({
          user_email: user.email,
          user_name: user.name || 'Unknown User',
          subscription_date: new Date().toISOString()
        });
      }
      setIsSubscribed((prev) => prev !== true ? true : prev);
      setPermission((prev) => prev !== 'granted' ? 'granted' : prev);
      return { success: true, message: 'Push notifications have been enabled successfully.' };
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async () => {
    try {
      setLoading(true);
      toast({
        title: 'Disable Notifications',
        description: 'Please disable notifications in your browser settings.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isSubscribed,
    permission,
    loading,
    enableNotifications,
    disableNotifications,
    checkNotificationStatus: () => {} // No-op, not needed anymore
  };
};

export default useNotifications;