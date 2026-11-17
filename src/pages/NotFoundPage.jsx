import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function NotFoundPage() {
    const { t } = useLanguage();

    return (
        <div>
            <h1>{t('notFound.title')}</h1>
            <p>{t('notFound.text')}</p>
            <Link to="/">{t('common.home')}</Link>
        </div>
    );
}

export default NotFoundPage;