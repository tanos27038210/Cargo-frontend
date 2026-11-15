import client from './client';

export const getOrderParcels = (orderId) => client.get(`/orders/${orderId}/parcels`);
export const createParcel = (orderId, data) => client.post(`/orders/${orderId}/parcels`, data);
export const updateParcel = (id, data) => client.put(`/parcels/${id}`, data);
export const deleteParcel = (id) => client.delete(`/parcels/${id}`);
export const changeParcelStatus = (id, data) => client.patch(`/parcels/${id}/status`, data);