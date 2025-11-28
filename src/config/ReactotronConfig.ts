/**
 * Reactotron Configuration
 *
 * This file configures Reactotron for debugging React Native apps.
 * Reactotron allows you to:
 * - View console logs
 * - Monitor API calls
 * - Inspect Redux state (if using Redux)
 * - Track async storage
 * - And more...
 */

import Reactotron from 'reactotron-react-native';
import { Platform } from 'react-native';

// Only configure Reactotron in development mode
if (__DEV__) {
  // For Android: use 10.0.2.2 for emulator (maps to host's localhost)
  // For physical Android devices, use your computer's local IP address (e.g., 192.168.x.x)
  // For iOS: use localhost (simulator shares network with host)
  const host = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2'; // Android emulator - change to your computer's IP if using physical device

  const reactotron = Reactotron.configure({
    name: 'PeakPilot',
    host,
  })
    .useReactNative({
      asyncStorage: false, // Set to true if you use AsyncStorage
      networking: {
        ignoreUrls: /symbolicate/,
      },
      editor: false,
      errors: { veto: stackFrame => false },
      overlay: false,
    })
    .connect();

  // Clear Reactotron on each app reload
  reactotron.clear?.();

  // Make Reactotron available globally for console.tron usage
  // @ts-ignore - Reactotron instance is compatible with our console.tron interface
  console.tron = reactotron;

  // Override console.log, console.warn, console.error to also log to Reactotron
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args: any[]) => {
    originalLog(...args);
    if (reactotron.log) {
      reactotron.log(args.length === 1 ? args[0] : args);
    }
  };

  console.warn = (...args: any[]) => {
    originalWarn(...args);
    if (reactotron.warn) {
      reactotron.warn(args.length === 1 ? args[0] : args);
    }
  };

  console.error = (...args: any[]) => {
    originalError(...args);
    if (reactotron.error) {
      reactotron.error(args.length === 1 ? args[0] : args, false);
    }
  };
}

export default Reactotron;
