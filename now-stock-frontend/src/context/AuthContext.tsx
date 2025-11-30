/**
 * @context AuthContext
 * @description
 * Define o "contrato" (interface) para o estado de autenticação global 
 * E preferências do usuário.
 * * CORREÇÃO: Agora usa o tipo 'User' de '../types/entities' para garantir
 * que campos como 'nivel_acesso' sejam reconhecidos.
 */
import { createContext } from 'react';
import type { User, AppColorScheme } from '../types/entities';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void; 

  theme: AppColorScheme;
  language: string;
  setTheme: (theme: AppColorScheme) => void;
  setLanguage: (lang: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);