import {createContext, useCallback, useContext, useMemo, useState} from "react";

const ToastContext = createContext(null);

export function ToastProvider({children}) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id != id));
    }, []);

    const addToast = useCallback(
        (type, message) => {
            const id = Date.now() + Math.random();
            setToasts((prev) => [...prev, {id, type, message}]);
            setTimeout(() => removeToast(id), 4000);
        },
        [removeToast]
    );
    const value = useMemo(
        () => ({
            success: (message) => addToast('success', message),
            error: (message) => addToast('error', message),
        }),
        [addToast]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    return useContext(ToastContext);
}