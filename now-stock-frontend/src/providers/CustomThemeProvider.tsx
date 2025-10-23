import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { ThemeContext } from '../context/ThemeContext';

type AppColorScheme = 'light' | 'dark';

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorScheme, setColorScheme] = useState<AppColorScheme>('light');

  const toggleColorScheme = () => {
    setColorScheme((current) => (current === 'dark' ? 'light' : 'dark'));
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