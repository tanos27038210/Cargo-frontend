import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ru from '../i18n/ru';
import en from '../i18n/en';

const DICTIONARIES = { ru, en };
const DEFAULT_LANGUAGE = 'en';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        const saved = localStorage.getItem('language');
        return DICTIONARIES[saved] ? saved : DEFAULT_LANGUAGE;
    });

    const setLanguage = useCallback((code) => {
        if (!DICTIONARIES[code]) {
            return;
        }
        localStorage.setItem('language', code);
        setLanguageState(code);
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const t = useCallback(
        (key, params) => {
            let text = DICTIONARIES[language][key] ?? DICTIONARIES[DEFAULT_LANGUAGE][key] ?? key;
            if (params) {
                Object.entries(params).forEach(([name, value]) => {
                    text = text.replaceAll(`{${name}}`, String(value));
                });
            }
            return text;
        },
        [language]
    );

    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    return useContext(LanguageContext);
}