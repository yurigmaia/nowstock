/**
 * @component CustomThemeProvider
 * @description
 * Provedor do Mantine que LÊ o tema (claro/escuro)
 * do AuthContext e o aplica na aplicação.
 */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme: colorScheme } = useAuth();

  const theme = useMemo(() => createTheme({
    fontFamily: 'Verdana, sans-serif',
    primaryColor: 'orange',
  }), []);

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      {children}
    </MantineProvider>
  );
};