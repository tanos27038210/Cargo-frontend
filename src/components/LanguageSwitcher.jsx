import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
];

function LanguageSwitcher({ variant = 'page' }) {
    const { language, setLanguage, t } = useLanguage();

    return (
        <div className={`lang-switcher lang-${variant}`} aria-label={t('language.label')}>
            {LANGUAGES.map((item) => (
                <button
                    key={item.code}
                    type="button"
                    className={item.code === language ? 'active' : ''}
                    onClick={() => setLanguage(item.code)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}

export default LanguageSwitcher;