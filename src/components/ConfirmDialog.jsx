function ConfirmDialog({
                           open,
                           title = 'Подтверждение',
                           message,
                           confirmText = 'Delete',
                           onConfirm,
                           onCancel,
                           loading = false,
                       }) {
    if (!open) {
        return null;
    }

    return (
        <div className="dialog-overlay" onClick={onCancel}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className="dialog-actions">
                    <button className="btn -secondary" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn-danger" onClick={onConfirm} disabled={loading}>
                        {loading ? 'delete...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog;