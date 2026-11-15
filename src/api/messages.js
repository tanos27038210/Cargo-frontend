import client from './client';

export const getMessages = (orderId) => client.get(`/orders/${orderId}/messages`);
export const createMessage = (orderId, data) => client.post(`/orders/${orderId}/messages`, data);