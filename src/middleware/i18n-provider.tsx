import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface I18nContextType {
  isLoading: boolean;
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for i18n to be initialized
    const checkI18nReady = () => {
      if (i18n.isInitialized) {
        setIsLoading(false);
      } else {
        // Check again after a short delay
        setTimeout(checkI18nReady, 50);
      }
    };

    checkI18nReady();
  }, [i18n]);

  const changeLanguage = async (lang: string) => {
    setIsLoading(true);
    await i18n.changeLanguage(lang);
    setIsLoading(false);
  };

  const value = {
    isLoading,
    language: i18n.language,
    changeLanguage,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
}
