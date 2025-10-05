import { createContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';

type AppColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: AppColorScheme;
  toggleColorScheme: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<ThemeContextType | null>(null);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorScheme, setColorScheme] = useState<AppColorScheme>(
    () => (localStorage.getItem('mantine-color-scheme') as AppColorScheme) || 'light'
  );
  const toggleColorScheme = () => {
    const nextColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(nextColorScheme);
    localStorage.setItem('mantine-color-scheme', nextColorScheme);
  };

  const theme = useMemo(() => createTheme({
    fontFamily: 'Verdana, sans-serif',
    primaryColor: 'orange',
  }), []);

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      <MantineProvider theme={theme} forceColorScheme={colorScheme}>
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
};