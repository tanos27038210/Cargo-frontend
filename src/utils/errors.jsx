export function getErrorMessage(error, fallback) {
    const status = error.response?.status;
    if (status === 403) {
        return 'У вас нет прав на это действие';
    }
    return error.response?.data?.message || fallback;
}