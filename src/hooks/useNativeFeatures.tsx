import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { Browser } from '@capacitor/browser';
import { toast } from 'sonner';

export function useNativeFeatures() {
  const [isNative, setIsNative] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<{ connected: boolean; connectionType: string }>({
    connected: true,
    connectionType: 'unknown'
  });
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsNative(platform !== 'web');

    const initNative = async () => {
      if (platform !== 'web') {
        // Hide splash screen after app loads
        await SplashScreen.hide();

        // Set status bar style
        try {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#0ea5e9' });
        } catch (e) {
          console.log('StatusBar not available');
        }

        // Get device info
        const info = await Device.getInfo();
        setDeviceInfo(info);

        // Setup keyboard listeners
        Keyboard.addListener('keyboardWillShow', () => {
          document.body.classList.add('keyboard-open');
        });

        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open');
        });

        // Setup back button handler with improved navigation
        App.addListener('backButton', ({ canGoBack }) => {
          // Check if we're on a modal or can go back in history
          const modals = document.querySelectorAll('[role="dialog"], [data-state="open"]');
          if (modals.length > 0) {
            // Close the modal by triggering escape key
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          } else if (canGoBack) {
            window.history.back();
          } else {
            // Show exit confirmation or just exit
            App.exitApp();
          }
        });

        // Setup app state listener
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
        });
      }

      // Network status (works on web too)
      const status = await Network.getStatus();
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType
      });

      Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus({
          connected: status.connected,
          connectionType: status.connectionType
        });
        
        if (!status.connected) {
          toast.error('No internet connection');
        }
      });
    };

    initNative();

    return () => {
      if (platform !== 'web') {
        Keyboard.removeAllListeners();
        App.removeAllListeners();
      }
      Network.removeAllListeners();
    };
  }, []);

  // Haptic feedback
  const hapticLight = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  }, []);

  const hapticMedium = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  }, []);

  const hapticHeavy = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'web') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  }, []);

  // Share functionality
  const share = useCallback(async (options: { title?: string; text?: string; url?: string }) => {
    try {
      await Share.share({
        title: options.title || 'SM Data App',
        text: options.text,
        url: options.url,
        dialogTitle: 'Share with friends'
      });
      return true;
    } catch (e) {
      console.log('Share failed or cancelled');
      return false;
    }
  }, []);

  // Clipboard functionality
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await Clipboard.write({ string: text });
      toast.success('Copied to clipboard');
      if (Capacitor.getPlatform() !== 'web') {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      return true;
    } catch (e) {
      toast.error('Failed to copy');
      return false;
    }
  }, []);

  const readFromClipboard = useCallback(async () => {
    try {
      const { value } = await Clipboard.read();
      return value;
    } catch (e) {
      return null;
    }
  }, []);

  // Open URL in browser
  const openBrowser = useCallback(async (url: string) => {
    try {
      await Browser.open({ url });
    } catch (e) {
      window.open(url, '_blank');
    }
  }, []);

  // Get app info
  const getAppInfo = useCallback(async () => {
    if (Capacitor.getPlatform() !== 'web') {
      return await App.getInfo();
    }
    return null;
  }, []);

  return {
    isNative,
    networkStatus,
    deviceInfo,
    hapticLight,
    hapticMedium,
    hapticHeavy,
    share,
    copyToClipboard,
    readFromClipboard,
    openBrowser,
    getAppInfo
  };
}
