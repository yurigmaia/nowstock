/**
 * @file useTheme.ts
 * @description
 * Hook customizado para consumir o ThemeContext de forma segura.
 */
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um CustomThemeProvider');
  }
  return context;
};