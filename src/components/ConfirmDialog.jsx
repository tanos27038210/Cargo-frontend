import { useLanguage } from '../context/LanguageContext';

function ConfirmDialog({
                           open,
                           title,
                           message,
                           confirmText,
                           onConfirm,
                           onCancel,
                           loading = false,
                       }) {
    const { t } = useLanguage();

    if (!open) {
        return null;
    }

    return (
        <div className="dialog-overlay" onClick={onCancel}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <h2>{title ?? t('dialog.confirmTitle')}</h2>
                <p>{message}</p>
                <div className="dialog-actions">
                    <button className="btn secondary" onClick={onCancel} disabled={loading}>
                        {t('dialog.cancel')}
                    </button>
                    <button className="btn danger" onClick={onConfirm} disabled={loading}>
                        {loading ? t('dialog.processing') : (confirmText ?? t('dialog.delete'))}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;