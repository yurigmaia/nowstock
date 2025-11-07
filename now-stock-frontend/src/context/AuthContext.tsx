/**
 * @context AuthContext
 * @description
 * Define o "contrato" (interface) e o Contexto React para
 * o estado de autenticação global E preferências do usuário (tema e idioma).
 */
import { createContext } from 'react';
import type { UserResponse } from '../services/authService';

export type AppColorScheme = 'light' | 'dark';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse | null;
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  
  // --- ADICIONE ESTAS LINHAS DE VOLTA ---
  theme: AppColorScheme;
  language: string;
  setTheme: (theme: AppColorScheme) => void;
  setLanguage: (lang: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);