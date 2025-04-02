import { useCallback, useState, useEffect } from 'react';

interface Settings {
  theme: 'light' | 'dark';
  language: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: number; // 0-6 (Sunday-Saturday)
  defaultShiftDuration: number; // in hours
  defaultBreakDuration: number; // in minutes
  notifications: {
    email: boolean;
    push: boolean;
    shiftReminders: boolean;
    conflictAlerts: boolean;
  };
  display: {
    showWeekends: boolean;
    showBreaks: boolean;
    showNotes: boolean;
    compactMode: boolean;
  };
}

const defaultSettings: Settings = {
  theme: 'light',
  language: 'en',
  timeFormat: '12h',
  weekStartsOn: 1, // Monday
  defaultShiftDuration: 8,
  defaultBreakDuration: 30,
  notifications: {
    email: true,
    push: true,
    shiftReminders: true,
    conflictAlerts: true,
  },
  display: {
    showWeekends: true,
    showBreaks: true,
    showNotes: true,
    compactMode: false,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('rota-tracker-settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('rota-tracker-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const updateNotificationSettings = useCallback(
    (notificationSettings: Partial<Settings['notifications']>) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...notificationSettings },
      }));
    },
    []
  );

  const updateDisplaySettings = useCallback(
    (displaySettings: Partial<Settings['display']>) => {
      setSettings((prev) => ({
        ...prev,
        display: { ...prev.display, ...displaySettings },
      }));
    },
    []
  );

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const toggleTimeFormat = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      timeFormat: prev.timeFormat === '12h' ? '24h' : '12h',
    }));
  }, []);

  const toggleCompactMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      display: { ...prev.display, compactMode: !prev.display.compactMode },
    }));
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    updateNotificationSettings,
    updateDisplaySettings,
    toggleTheme,
    toggleTimeFormat,
    toggleCompactMode,
  };
} 