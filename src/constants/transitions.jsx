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