export const ORDER_STATUS_LABELS = {
    DRAFT: 'Черновик',
    CONFIRMED: 'Подтверждён',
    PICKUP_SCHEDULED: 'Забор назначен',
    IN_TRANSIT: 'В пути',
    AT_WAREHOUSE: 'На складе',
    OUT_FOR_DELIVERY: 'Передан курьеру',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменён',
    RETURNED: 'Возвращён',
};

export const PARCEL_STATUS_LABELS = {
    REGISTERED: 'Зарегистрирована',
    PICKED_UP: 'Забрана',
    IN_TRANSIT: 'В пути',
    SORTING_CENTER: 'В сортировочном центре',
    OUT_FOR_DELIVERY: 'Передана курьеру',
    DELIVERED: 'Доставлена',
    DAMAGED: 'Повреждена',
    LOST: 'Потеряна',
    RETURNED: 'Возвращена',
};

export const DELIVERY_TYPE_LABELS = {
    STANDARD: 'Стандартная',
    EXPRESS: 'Экспресс',
};

export const STATUS_LABELS = { ...ORDER_STATUS_LABELS, ...PARCEL_STATUS_LABELS };