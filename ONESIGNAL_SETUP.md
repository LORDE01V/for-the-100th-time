# OneSignal Push Notifications Setup Guide

This guide explains how to set up OneSignal push notifications for the GridX application.

## Required Environment Variables

### Frontend (.env file in frontend directory)
```
REACT_APP_ONESIGNAL_APP_ID=your_onesignal_app_id_here
```

### Backend (.env file in Backend directory)
```
ONESIGNAL_APP_ID=your_onesignal_app_id_here
ONESIGNAL_API_KEY=your_onesignal_api_key_here
```

## OneSignal Account Setup

1. **Create OneSignal Account**
   - Go to https://onesignal.com/
   - Sign up for a free account

2. **Create a New App**
   - Click "New App/Website"
   - Enter your app name (e.g., "GridX Energy")
   - Select "Web Push" platform

3. **Configure Web Push**
   - Choose "Typical Site" setup
   - Enter your site URL (e.g., http://localhost:3000 for development)
   - Configure your site name and icon

4. **Get Your Credentials**
   - App ID: Found in Settings > Keys & IDs
   - API Key: Found in Settings > Keys & IDs (REST API Key)

## Files Already Created

The following files have been automatically created for OneSignal integration:

### Frontend Files
- `public/OneSignalSDKWorker.js` - Service worker for push notifications
- `public/OneSignalSDKUpdaterWorker.js` - Service worker updater
- `src/services/notificationService.js` - Notification service wrapper
- `src/hooks/useNotifications.js` - React hook for notification management

### Backend Integration
- Push notifications are integrated into payment success flows
- Notifications are sent for successful top-ups and subscription activations
- Backend endpoints available for testing notifications

## Testing Push Notifications

1. **Set Environment Variables**
   - Add your OneSignal App ID to `REACT_APP_ONESIGNAL_APP_ID`
   - Add your OneSignal API Key to `ONESIGNAL_API_KEY`

2. **Start the Application**
   ```bash
   # Frontend
   cd frontend
   npm start

   # Backend
   cd Backend
   python main.py
   ```

3. **Enable Notifications**
   - Navigate to the HomePage
   - Click "Enable Push Notifications"
   - Allow browser permissions when prompted

4. **Test Payment Notifications**
   - Make a test top-up or subscription payment
   - You should receive a push notification upon successful payment

5. **Test Manual Notifications** (Backend API)
   ```bash
   # Test notification endpoint
   curl -X POST http://localhost:5000/api/notify/test

   # Send custom notification
   curl -X POST http://localhost:5000/api/notifications/send \
     -H "Content-Type: application/json" \
     -d '{"message": "Test message", "heading": "Test Heading"}'
   ```

## Browser Compatibility

OneSignal push notifications work on:
- Chrome 50+
- Firefox 44+
- Safari 16+ (macOS 13+)
- Edge 79+

## Troubleshooting

### Common Issues

1. **"Could not prompt for notifications" Error**
   - Ensure REACT_APP_ONESIGNAL_APP_ID is set correctly
   - Check browser console for detailed error messages
   - Verify OneSignal service worker files are accessible

2. **Notifications Not Received**
   - Check if browser notifications are enabled
   - Verify OneSignal API key is correct in backend
   - Check browser developer tools for subscription status

3. **Service Worker Issues**
   - Clear browser cache and cookies
   - Check if service workers are enabled in browser
   - Verify OneSignal worker files are properly loaded

4. **Development vs Production**
   - Use `allowLocalhostAsSecureOrigin: true` for local development
   - For production, ensure HTTPS is enabled
   - Update OneSignal app settings with production domain

## Features Implemented

- ✅ Push notification permission handling
- ✅ User subscription status tracking
- ✅ Payment success notifications
- ✅ Error handling and user feedback
- ✅ Browser compatibility checks
- ✅ User identification and tagging
- ✅ Notification event listeners
- ✅ Backend notification endpoints

## Next Steps

1. Set up your OneSignal account and get credentials
2. Add environment variables to your `.env` files
3. Test the notification flow
4. Customize notification messages as needed
5. Set up production domain in OneSignal dashboard