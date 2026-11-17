import { useLanguage } from '../context/LanguageContext';

function StatusBadge({ status, type = 'order' }) {
    const { t } = useLanguage();

    const key = `${type}Status.${status}`;
    const text = t(key);

    return (
        <span className={`badge badge-${status}`}>
      {text === key ? status : text}
    </span>
    );
}

export default StatusBadge;