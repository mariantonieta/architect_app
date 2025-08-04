import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

export const LanguageToggle: React.FC = () => {
  const { changeLanguage, currentLanguage, availableLanguages } = useLanguage();

  const toggleLanguage = () => {
    const currentIndex = availableLanguages.findIndex(lang => lang.code === currentLanguage);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    changeLanguage(availableLanguages[nextIndex].code);
  };

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);
  const nextLang = availableLanguages.find(lang => lang.code !== currentLanguage);

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-4 right-[5rem] z-50 p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      title={`Cambiar a ${nextLang?.name || 'otro idioma'}`}
    >
      <div className="flex items-center justify-center w-5 h-5">
        <span className="text-lg leading-none">
          {currentLang?.flag || '🌐'}
        </span>
      </div>
    </button>
  );
};
