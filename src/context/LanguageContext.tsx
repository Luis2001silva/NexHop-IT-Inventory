import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations } from '../locales/translations';

type LanguageContextType = {
  language: 'pt' | 'en';
  setLanguage: (language: 'pt' | 'en') => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<'pt' | 'en'>(() => {
    const stored = localStorage.getItem('language');
    return stored === 'en' ? 'en' : 'pt';
  });

  const setLanguage = (next: 'pt' | 'en') => {
    setLanguageState(next);
    localStorage.setItem('language', next);
    document.documentElement.lang = next;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
