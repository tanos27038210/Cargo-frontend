import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function AccessDeniedPage() {
    const { t } = useLanguage();

    return (
        <div>
            <h1>{t('accessDenied.title')}</h1>
            <p>{t('accessDenied.text')}</p>
            <Link to="/">{t('common.home')}</Link>
        </div>
    );
}

export default AccessDeniedPage;