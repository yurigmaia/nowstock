// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Força o idioma inicial para Português.
    lng: 'pt',

    // Idioma de fallback caso uma tradução não seja encontrada.
    fallbackLng: 'en',

    // Habilita logs no console do navegador (F12) para ajudar a debugar.
    debug: true, 

    interpolation: {
      escapeValue: false, // O React já protege contra ataques XSS.
    },

    // Configuração para o plugin que carrega os arquivos.
    backend: {
      // Caminho dinâmico para os arquivos de tradução na pasta 'public'.
      loadPath: '/locales/{{lng}}/translation.json',
    },

    // Configuração para a integração com React.
    react: {
      // Habilita a integração com o Suspense. ESTA É A CHAVE.
      useSuspense: true,
    },
  });

export default i18n;