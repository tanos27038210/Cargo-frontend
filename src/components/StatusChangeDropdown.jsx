import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function StatusChangeDropdown({ allowedStatuses, onChange, loading, type = 'order' }) {
    const { t } = useLanguage();
    // Выбранный статус и комментарий хранит сам компонент
    const [newStatus, setNewStatus] = useState('');
    const [comment, setComment] = useState('');

    if (allowedStatuses.length === 0) {
        return <p className="muted">{t('statusChange.none')}</p>;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!newStatus) {
            return;
        }
        const ok = await onChange(newStatus, comment.trim());
        if (ok) {
            setNewStatus('');
            setComment('');
        }
    };

    return (
        <form className="status-form" onSubmit={handleSubmit}>
            <label className="form-field">
                <span>{t('statusChange.newStatus')}</span>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="">{t('statusChange.choose')}</option>
                    {allowedStatuses.map((code) => (
                        <option key={code} value={code}>
                            {t(`${type}Status.${code}`)}
                        </option>
                    ))}
                </select>
            </label>

            <label className="form-field">
                <span>{t('statusChange.comment')}</span>
                <input
                    type="text"
                    maxLength={250}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </label>

            <button type="submit" className="btn" disabled={!newStatus || loading}>
                {loading ? t('statusChange.saving') : t('statusChange.submit')}
            </button>
        </form>
    );
}

export default StatusChangeDropdown;