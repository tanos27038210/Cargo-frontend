import client from './client';

export const getOrders = (params) => client.get('/orders', { params });
export const getOrder = (id) => client.get(`/orders/${id}`);
export const createOrder = (data) => client.post('/orders', data);
export const updateOrder = (id, data) => client.put(`/orders/${id}`, data);
export const deleteOrder = (id) => client.delete(`/orders/${id}`);
export const changeOrderStatus = (id, data) => client.patch(`/orders/${id}/status`, data);
export const getOrderHistory = (id) => client.get(`/orders/${id}/history`);