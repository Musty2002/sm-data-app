import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const FCM_TOKEN_KEY = 'fcm_token';

export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Auto-enable notifications by default
    const storedEnabled = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    if (storedEnabled === null) {
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      setIsEnabled(true);
    } else {
      setIsEnabled(storedEnabled === 'true');
    }

    // Check for stored FCM token
    const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
    if (storedToken) {
      setPushToken(storedToken);
      setIsRegistered(true);
    }

    // Only initialize push on native platforms
    if (Capacitor.isNativePlatform()) {
      initPush();
    }
  }, []);

  const subscribeToTopic = async (topic: string) => {
    console.log(`Device will receive notifications for topic: ${topic}`);
  };

  const initPush = async () => {
    try {
      // Dynamically import to avoid crashes on web
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // Request local notification permission
      try {
        const localPermStatus = await LocalNotifications.checkPermissions();
        if (localPermStatus.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch (localError) {
        console.warn('Local notifications not available:', localError);
      }

      // Request push notification permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }

      // Remove any existing listeners before adding new ones
      await PushNotifications.removeAllListeners();

      // On registration success
      await PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, FCM token:', token.value);
        setPushToken(token.value);
        setIsRegistered(true);
        localStorage.setItem(FCM_TOKEN_KEY, token.value);
        await subscribeToTopic('all');
      });

      // On registration error
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // Handle push notification received while app is in foreground
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received:', notification);
        toast.info(notification.title || 'New notification', {
          description: notification.body
        });
      });

      // Handle push notification action (user tapped on notification)
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed:', notification);
        const data = notification.notification.data;
        if (data?.route) {
          window.location.href = data.route;
        }
      });

      // Register for push notifications AFTER listeners are set up
      await PushNotifications.register();

    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  // Enable/disable notifications
  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
    setIsEnabled(enabled);
  }, []);

  // Send local notification
  const sendLocalNotification = useCallback(async (options: {
    title: string;
    body: string;
    id?: number;
    schedule?: { at: Date };
  }) => {
    if (!isEnabled) return;

    if (!Capacitor.isNativePlatform()) {
      toast.info(options.title, { description: options.body });
      return;
    }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: options.title,
            body: options.body,
            id: options.id || Math.floor(Math.random() * 100000),
            schedule: options.schedule,
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
      toast.info(options.title, { description: options.body });
    }
  }, [isEnabled]);

  // Cancel scheduled notification
  const cancelNotification = useCallback(async (id: number) => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const pending = await LocalNotifications.getPending();
      await LocalNotifications.cancel({ notifications: pending.notifications });
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }, []);

  return {
    pushToken,
    isRegistered,
    isEnabled,
    setNotificationsEnabled,
    sendLocalNotification,
    cancelNotification,
    cancelAllNotifications
  };
}
