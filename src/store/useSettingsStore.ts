import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await localforage.getItem(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  defaultFocusDuration: number;
  setDefaultFocusDuration: (duration: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      defaultFocusDuration: 60 * 60,
      setDefaultFocusDuration: (duration) => set({ defaultFocusDuration: duration }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
