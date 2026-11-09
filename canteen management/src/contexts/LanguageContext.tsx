import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '@/lib/i18n';

type TranslationKey = keyof typeof TRANSLATIONS.EN;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tb_language') as Language;
    return saved && ['EN', 'HI', 'GU'].includes(saved) ? saved : 'EN';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tb_language', lang);
  };

  const t = (key: TranslationKey): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.EN;
    return (langDict[key] as string) || (TRANSLATIONS.EN[key] as string) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};

