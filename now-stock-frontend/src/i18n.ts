/**
 * @file i18n.ts
 * @description
 * Configuração principal da biblioteca i18next para internacionalização.
 * Utiliza o backend para carregar arquivos JSON da pasta /public/locales
 * e o LanguageDetector para persistir a escolha do usuário no localStorage.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    lng: 'pt',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: true,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['i18nextLng'],
    }
  });

export default i18n;