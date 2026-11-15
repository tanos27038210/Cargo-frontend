const ORDER_TRANSITIONS = {
    DRAFT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PICKUP_SCHEDULED', 'CANCELLED'],
    PICKUP_SCHEDULED: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['AT_WAREHOUSE', 'OUT_FOR_DELIVERY', 'RETURNED'],
    AT_WAREHOUSE: ['OUT_FOR_DELIVERY', 'RETURNED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
    RETURNED: ['CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
};

const ORDER_ADMIN_ONLY_TRANSITIONS = {
    IN_TRANSIT: ['CANCELLED'],
};

export function getAllowedOrderStatuses(current, isAdmin) {
    const regular = ORDER_TRANSITIONS[current] || [];
    const adminOnly = isAdmin ? ORDER_ADMIN_ONLY_TRANSITIONS[current] || [] : [];
    return [...regular, ...adminOnly];
}

const PARCEL_TRANSITIONS = {
    REGISTERED: ['PICKED_UP'],
    PICKED_UP: ['IN_TRANSIT', 'DAMAGED', 'LOST'],
    IN_TRANSIT: ['SORTING_CENTER', 'OUT_FOR_DELIVERY', 'DAMAGED', 'LOST', 'RETURNED'],
    SORTING_CENTER: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DAMAGED', 'LOST', 'RETURNED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'DAMAGED', 'LOST', 'RETURNED'],
    DAMAGED: ['RETURNED'],
    DELIVERED: [],
    RETURNED: [],
    LOST: [],
};

const PARCEL_ADMIN_ONLY_TRANSITIONS = {
    LOST: ['OUT_FOR_DELIVERY'],
};

export function getAllowedParcelStatuses(current, isAdmin) {
    const regular = PARCEL_TRANSITIONS[current] || [];
    const adminOnly = isAdmin ? PARCEL_ADMIN_ONLY_TRANSITIONS[current] || [] : [];
    return [...regular, ...adminOnly];
}