import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';

interface AppSettings {
  // Theme
  themeMode: ThemeMode;
  isDark: boolean;

  // Playback
  autoSwitchOnBuffer: boolean;
  bufferThreshold: number;
  lowLatencyMode: boolean;
  defaultVolume: number;
  autoPlay: boolean;
  rememberLastChannel: boolean;

  // Quality
  preferredQuality: 'auto' | 'low' | 'medium' | 'high' | '2k' | '4k' | '8k';
  maxBitrate: number;

  // Notifications
  streamAlerts: boolean;
  newChannelAlerts: boolean;

  // Data
  watchHistory: boolean;
  cacheStreams: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;

  // Language
  language: string;
}

const DEFAULT_SETTINGS: Omit<AppSettings, 'isDark'> = {
  themeMode: 'dark',
  autoSwitchOnBuffer: true,
  bufferThreshold: 10000,
  lowLatencyMode: true,
  defaultVolume: 0.8,
  autoPlay: true,
  rememberLastChannel: true,
  preferredQuality: 'auto',
  maxBitrate: 0,
  streamAlerts: true,
  newChannelAlerts: false,
  watchHistory: true,
  cacheStreams: true,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  language: 'en',
};

interface SettingsContextType extends AppSettings {
  updateSetting: <K extends keyof Omit<AppSettings, 'isDark'>>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'sports_tv_settings_v2';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Omit<AppSettings, 'isDark'>>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [systemColorScheme, setSystemColorScheme] = useState(
    Appearance.getColorScheme() || 'dark'
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || 'dark');
    });

    loadSettings();

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveSettings();
    }
  }, [settings, isLoading]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = useCallback(<K extends keyof Omit<AppSettings, 'isDark'>>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => {
      const modes: ThemeMode[] = ['system', 'light', 'dark'];
      const currentIndex = modes.indexOf(prev.themeMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...prev, themeMode: modes[nextIndex] };
    });
  }, []);

  const isDark = settings.themeMode === 'system'
    ? systemColorScheme === 'dark'
    : settings.themeMode === 'dark';

  const value: SettingsContextType = {
    ...settings,
    isDark,
    updateSetting,
    resetSettings,
    toggleTheme,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export const THEMES = {
  dark: {
    background: '#0a0a12',
    surface: '#0d0d1a',
    card: 'rgba(255, 255, 255, 0.02)',
    text: '#e2e8f0',
    textMuted: '#64748b',
    textDim: '#475569',
    border: 'rgba(255, 255, 255, 0.06)',
    primary: '#6366f1',
    primaryMuted: 'rgba(99, 102, 241, 0.15)',
    secondary: '#a5b4fc',
    accent: '#fbbf24',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    card: 'rgba(0, 0, 0, 0.02)',
    text: '#1e293b',
    textMuted: '#64748b',
    textDim: '#94a3b8',
    border: 'rgba(0, 0, 0, 0.08)',
    primary: '#6366f1',
    primaryMuted: 'rgba(99, 102, 241, 0.1)',
    secondary: '#4f46e5',
    accent: '#f59e0b',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
};

export function useTheme() {
  const { isDark } = useSettings();
  return isDark ? THEMES.dark : THEMES.light;
}
