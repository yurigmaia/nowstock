/**
 * @component AuthProvider
 * @description
 * Provedor que implementa a lógica do AuthContext, gerenciando o estado
 * de login, token, usuário, tema e idioma.
 */
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, type AppColorScheme } from '../context/AuthContext';
import type { UserResponse } from '../services/authService';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';

const getStoredUser = (): UserResponse | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
};

const getStoredToken = (): string | null => localStorage.getItem('authToken');
const getStoredTheme = (): AppColorScheme => (localStorage.getItem('nowstock-theme') as AppColorScheme) || 'dark';
const getStoredLang = (): string => localStorage.getItem('i18nextLng') || 'pt';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();

  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<UserResponse | null>(getStoredUser);
  
  const [theme, setThemeState] = useState<AppColorScheme>(getStoredTheme);
  const [language, setLanguageState] = useState<string>(getStoredLang);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const login = (newToken: string, newUser: UserResponse) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Define as preferências vindas do banco de dados (ou usa o padrão)
    const userTheme = newUser.tema || 'dark';
    const userLang = newUser.idioma || 'pt';
    setThemeState(userTheme);
    setLanguageState(userLang);
    localStorage.setItem('nowstock-theme', userTheme);
    i18n.changeLanguage(userLang); // Atualiza o i18n
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };
  
  const setTheme = (newTheme: AppColorScheme) => {
    setThemeState(newTheme);
    localStorage.setItem('nowstock-theme', newTheme);
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiService.updateUserPreferences(user.id, { tema: newTheme } as any);
    }
  };

  const setLanguage = (newLang: string) => {
    setLanguageState(newLang);
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiService.updateUserPreferences(user.id, { idioma: newLang } as any);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, theme, language, setTheme, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};