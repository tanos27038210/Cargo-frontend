import {useState} from "react";
import {STATUS_LABELS} from "../constants/statuses.jsx";

function StatusChangeDropdown({allowedStatuses, onChange, loading}) {
    const [newStatus, setNewStatus] = useState('');
    const [comment, setComment] = useState('');

    if (allowedStatuses.length === 0) {
        return <p className="muted">There are no transitions from this status</p>;
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
                <span>New status</span>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="">Choose status</option>
                    {allowedStatuses.map((code) => (
                        <option key={code} value={code}>
                            {STATUS_LABELS[code]}
                        </option>
                    ))}
                </select>
            </label>

            <label className="form-field">
                <span>Comment (Not required)</span>
                <input
                    type="text"
                    maxLength={250}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </label>

            <button type="submit" className="btn" disabled={!newStatus || loading}>
                {loading ? 'Saving...' : 'Change status'}
            </button>
        </form>
    )
}

export default StatusChangeDropdown;