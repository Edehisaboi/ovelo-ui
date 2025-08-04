import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, ThemeType, getColors } from '../constants/Colors';

interface ThemeContextProps {
  theme: ThemeType;
  isDarkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemTheme = (useColorScheme() as ThemeType) || 'light';
  const [theme, setTheme] = useState<ThemeType>(systemTheme);

  // Always sync theme with system (resets any override on system change)
  useEffect(() => {
    setTheme(systemTheme);
  }, [systemTheme]);

  // Temporary override for current session (resets on next system change)
  const setDarkMode = (enabled: boolean) => {
    setTheme(enabled ? 'dark' : 'light');
  };

  const isDarkMode = theme === 'dark';
  const colors = getColors(theme);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, setDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
