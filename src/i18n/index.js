import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fa from './locales/fa.json';

// Detect language synchronously before initialization
const getInitialLanguage = () => {
  // Check localStorage first
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage) {
    return savedLanguage.startsWith('fa') ? 'fa' : 'en';
  }

  // Check browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('fa')) {
    return 'fa';
  }

  // Default to English
  return 'en';
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa }
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
