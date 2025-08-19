import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {}
      },
      pt: {
        translation: {}
      }
    }
  });

const loadTranslations = async () => {
  const ptTranslations = await fetch('/locales/pt/translation.json').then(res => res.json());
  const enTranslations = await fetch('/locales/en/translation.json').then(res => res.json());
  i18n.addResourceBundle('pt', 'translation', ptTranslations);
  i18n.addResourceBundle('en', 'translation', enTranslations);
};

loadTranslations();

export default i18n;