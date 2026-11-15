import { useEffect, useRef, useState } from 'react';
import { createMessage, getMessages } from '../api/messages';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLE_LABELS } from '../constants/roles';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/format';

const MAX_LENGTH = 1000;

function MessagesSection({ orderId, canAccess }) {
    const { user } = useAuth();
    const toast = useToast();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(canAccess);
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const listRef = useRef(null);

    useEffect(() => {
        if (!canAccess) {
            return;
        }
        const load = async () => {
            try {
                const response = await getMessages(orderId);
                setMessages(response.data);
            } catch (err) {
                toast.error(getErrorMessage(err, 'Failed to load message'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [orderId, canAccess, reloadKey]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) {
            setError('Enter text message');
            return;
        }

        setError('');
        setSending(true);
        try {
            const response = await createMessage(orderId, { text: trimmed });
            setMessages((prev) => [...prev, response.data]);
            setText('');
        } catch (err) {
            const fieldError = err.response?.data?.details?.find((d) => d.field === 'text');
            if (fieldError) {
                setError(fieldError.message);
            } else {
                toast.error(getErrorMessage(err, 'Failed to send message'));
            }
        } finally {
            setSending(false);
        }
    };

    if (!canAccess) {
        return (
            <section className="card">
                <h2>Messages</h2>
                <p className="muted">
                    Order messages are available to the assigned manager and administrator.
                </p>
            </section>
        );
    }

    return (
        <section className="card">
            <div className="card-header">
                <h2>Messages ({messages.length})</h2>
                <button className="btn secondary" onClick={() => setReloadKey((k) => k + 1)}>
                    Update
                </button>
            </div>

            <div className="message-list" ref={listRef}>
                {loading && <p className="muted">Loading...</p>}
                {!loading && messages.length === 0 && (
                    <p className="muted">No messages yet. Write the first one.</p>
                )}
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={m.authorId === user.id ? 'message message-own' : 'message'}
                    >
                        <div className="message-meta">
                            <strong>{m.authorName}</strong>
                            <span className="message-role">{ROLE_LABELS[m.authorRole] || m.authorRole}</span>
                            <span className="muted">{formatDateTime(m.createdAt)}</span>
                        </div>
                        <div className="message-text">{m.text}</div>
                    </div>
                ))}
            </div>

            <form className="message-form" onSubmit={handleSubmit} noValidate>
        <textarea
            rows={3}
            maxLength={MAX_LENGTH}
            value={text}
            placeholder="Enter message"
            onChange={(e) => setText(e.target.value)}
            className={error ? 'has-error' : ''}
        />
                <div className="message-form-footer">
                    <span className="muted">{text.length} / {MAX_LENGTH}</span>
                    <button type="submit" className="btn" disabled={sending}>
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </div>
                {error && <span className="field-error">{error}</span>}
            </form>
        </section>
    );
}

export default MessagesSection;