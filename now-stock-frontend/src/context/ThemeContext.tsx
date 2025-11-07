/**
 * @file ThemeContext.ts
 * @description
 * Define o Contexto do React para o gerenciamento do tema (claro/escuro).
 */
import { createContext } from 'react';

export type AppColorScheme = 'light' | 'dark';

export interface ThemeContextType {
  colorScheme: AppColorScheme;
  toggleColorScheme: (scheme?: AppColorScheme) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);