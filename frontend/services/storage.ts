/**
 * Platform-aware secure storage.
 * - Native (Android/iOS): expo-secure-store (encrypted)
 * - Web: localStorage fallback (for dev/web preview)
 */
import { Platform } from 'react-native';

let SecureStore: typeof import('expo-secure-store') | null = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

export async function secureGet(key: string): Promise<string | null> {
  try {
    if (SecureStore) {
      return await SecureStore.getItemAsync(key);
    }
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('[Storage] secureGet error:', e);
    return null;
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  try {
    if (SecureStore) {
      await SecureStore.setItemAsync(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn('[Storage] secureSet error:', e);
  }
}

export async function secureDel(key: string): Promise<void> {
  try {
    if (SecureStore) {
      await SecureStore.deleteItemAsync(key);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('[Storage] secureDel error:', e);
  }
}
