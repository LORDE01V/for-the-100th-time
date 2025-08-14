import OneSignal from 'react-onesignal';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.appId = process.env.REACT_APP_ONESIGNAL_APP_ID;
  }

  async initialize() {
    if (this.isInitialized || !this.appId) {
      return;
    }

    try {
      await OneSignal.init({
        appId: this.appId,
        allowLocalhostAsSecureOrigin: true,
        // Don't auto-prompt, we'll handle this manually
        autoResubscribe: true,
        notifyButton: {
          enable: false // We'll use our custom button
        },
        welcomeNotification: {
          disable: true // Disable default welcome notification
        }
      });

      this.isInitialized = true;
      console.log('OneSignal initialized successfully');
    } catch (error) {
      console.error('OneSignal initialization failed:', error);
      throw error;
    }
  }

  async requestPermission() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      // Check current permission status
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // No need to show a OneSignal prompt; react-onesignal does not support it
        return true;
      } else if (permission === 'denied') {
        throw new Error('Notification permission was denied');
      } else {
        throw new Error('Notification permission was dismissed');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  async checkPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    
    return Notification.permission;
  }

  async isSubscribed() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      return await OneSignal.isPushNotificationsEnabled();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  async getUserId() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      return await OneSignal.getUserId();
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  async setExternalUserId(userId) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await OneSignal.setExternalUserId(userId);
      console.log('External user ID set:', userId);
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  }

  async sendTag(key, value) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await OneSignal.sendTag(key, value);
      console.log('Tag sent:', key, value);
    } catch (error) {
      console.error('Error sending tag:', error);
    }
  }

  async sendTags(tags) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await OneSignal.sendTags(tags);
      console.log('Tags sent:', tags);
    } catch (error) {
      console.error('Error sending tags:', error);
    }
  }

  // Listen for notification events
  onNotificationDisplay(callback) {
    if (this.isInitialized) {
      OneSignal.on('notificationDisplay', callback);
    }
  }

  onNotificationClick(callback) {
    if (this.isInitialized) {
      OneSignal.on('notificationClick', callback);
    }
  }

  onSubscriptionChange(callback) {
    if (this.isInitialized) {
      OneSignal.on('subscriptionChange', callback);
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;