import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language;

  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  return {
    changeLanguage,
    currentLanguage,
    availableLanguages,
  };
};
