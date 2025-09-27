import { useState } from 'react';

// 自定义 Hook 用于本地存储
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 设置值
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// 预定义的存储键
export const STORAGE_KEYS = {
  USER_STATS: 'message-bottle-user-stats',
  WALLET_STATE: 'message-bottle-wallet-state',
  UI_PREFERENCES: 'message-bottle-ui-preferences',
  BOTTLES_FOUND: 'message-bottle-bottles-found',
  EXPLORATION_HISTORY: 'message-bottle-exploration-history'
} as const;