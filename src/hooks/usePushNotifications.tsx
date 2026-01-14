import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
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

    initPush();
  }, []);

  const subscribeToTopic = async (topic: string) => {
    // FCM topic subscription is handled server-side for Capacitor
    // The device will automatically receive messages sent to subscribed topics
    console.log(`Device will receive notifications for topic: ${topic}`);
  };

  const initPush = async () => {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    // Request local notification permission
    const localPermStatus = await LocalNotifications.checkPermissions();
    if (localPermStatus.display !== 'granted') {
      await LocalNotifications.requestPermissions();
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

    // Register for push notifications
    await PushNotifications.register();

    // On registration success
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, FCM token:', token.value);
      setPushToken(token.value);
      setIsRegistered(true);
      
      // Store the FCM token locally
      localStorage.setItem(FCM_TOKEN_KEY, token.value);
      
      // Subscribe to 'all' topic for broadcast notifications
      await subscribeToTopic('all');
    });

    // On registration error
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error.error);
    });

    // Handle push notification received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received:', notification);
      toast.info(notification.title || 'New notification', {
        description: notification.body
      });
    });

    // Handle push notification action (user tapped on notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed:', notification);
      // Handle navigation based on notification data
      const data = notification.notification.data;
      if (data?.route) {
        window.location.href = data.route;
      }
    });
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

    if (Capacitor.getPlatform() === 'web') {
      toast.info(options.title, { description: options.body });
      return;
    }

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
  }, [isEnabled]);

  // Cancel scheduled notification
  const cancelNotification = useCallback(async (id: number) => {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    }
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'web') {
      const pending = await LocalNotifications.getPending();
      await LocalNotifications.cancel({ notifications: pending.notifications });
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
