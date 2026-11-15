export const formatDateTime = (value) =>
    value ? value.slice(0, 16).replace('T', ' ') : '-';