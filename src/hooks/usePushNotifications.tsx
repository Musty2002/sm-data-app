import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const initPush = async () => {
      if (Capacitor.getPlatform() === 'web') {
        return;
      }

      // Request permission
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
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token:', token.value);
        setPushToken(token.value);
        setIsRegistered(true);
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

    initPush();

    return () => {
      if (Capacitor.getPlatform() !== 'web') {
        PushNotifications.removeAllListeners();
      }
    };
  }, []);

  // Send local notification
  const sendLocalNotification = useCallback(async (options: {
    title: string;
    body: string;
    id?: number;
    schedule?: { at: Date };
  }) => {
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
  }, []);

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
    sendLocalNotification,
    cancelNotification,
    cancelAllNotifications
  };
}
