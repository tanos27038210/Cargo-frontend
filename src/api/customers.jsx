import client from "./client.js";

export const createCustomer = (data) => client.post(`/customers`, data);
export const getCustomers = (params) => client.get('/customers', {params});
export const getCustomerById = (id) => client.get(`/customers/${id}`);
export const updateCustomer = (id, data) => client.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => client.delete(`/customers/${id}`);