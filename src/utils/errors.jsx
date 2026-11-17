const FORBIDDEN_TEXT = {
    ru: 'У вас нет прав на это действие',
    en: 'You do not have permission to perform this action',
};

export function getErrorMessage(error, fallback) {
    const status = error.response?.status;
    if (status === 403) {
        // Язык, который выбрал пользователь; если там пусто, берём русский
        return FORBIDDEN_TEXT[localStorage.getItem('language')] ?? FORBIDDEN_TEXT.ru;
    }
    return error.response?.data?.message || fallback;
}