/**
 * @component AuthProvider
 * @description
 * Implementação da lógica de Autenticação e Preferências.
 * Gerencia os estados, sincroniza com o localStorage e chama a API
 * para salvar as configurações do usuário (Tema/Idioma) no banco.
 */
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import type { User, AppColorScheme } from '../types/entities';
import { apiService } from '../services/api';

const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
};

const getStoredToken = (): string | null => localStorage.getItem('token');

const getStoredTheme = (): AppColorScheme => (localStorage.getItem('nowstock-theme') as AppColorScheme) || 'dark';
const getStoredLang = (): string => localStorage.getItem('i18nextLng') || 'pt';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();

  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUserState] = useState<User | null>(getStoredUser);
  
  const [theme, setThemeState] = useState<AppColorScheme>(getStoredTheme);
  const [language, setLanguageState] = useState<string>(getStoredLang);

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const setUser = (userData: User) => {
    setUserState(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUserState(newUser);
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    const userTheme = (newUser.tema as AppColorScheme) || 'dark';
    const userLang = newUser.idioma || 'pt';

    setThemeState(userTheme);
    setLanguageState(userLang);
    
    localStorage.setItem('nowstock-theme', userTheme);
    i18n.changeLanguage(userLang);
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const setTheme = (newTheme: AppColorScheme) => {
    setThemeState(newTheme);
    localStorage.setItem('nowstock-theme', newTheme);
    
    if (user) {
      apiService.updateUserPreferences(user.id, { tema: newTheme })
        .catch(err => console.error("Falha ao salvar tema no banco:", err));
    }
  };

  const setLanguage = (newLang: string) => {
    setLanguageState(newLang);
    localStorage.setItem('i18nextLng', newLang);
    i18n.changeLanguage(newLang);
    
    if (user) {
      apiService.updateUserPreferences(user.id, { idioma: newLang })
        .catch(err => console.error("Falha ao salvar idioma no banco:", err));
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      setUser,
      login, 
      logout, 
      theme, 
      language, 
      setTheme, 
      setLanguage 
    }}>
      {children}
    </AuthContext.Provider>
  );
};