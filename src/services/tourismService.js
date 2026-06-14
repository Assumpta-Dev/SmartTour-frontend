import axios from 'axios';
const API = import.meta.env?.VITE_API_URL ?? 'http://localhost:4000/api';
// Locations
export const fetchLocations = (featured) => axios.get(`${API}/locations`, { params: { ...(featured ? { featured: true } : {}), includeCounts: true } }).then(r => r.data);
export const fetchLocation = (slug) => axios.get(`${API}/locations/${slug}`).then(r => r.data);
// Nearby locations (GPS explorer)
export const fetchNearbyLocations = (lat, lng, radius = 5000) => axios.get(`${API}/nearby`, { params: { lat, lng, radius } }).then(r => r.data);
// Admin stats
export const fetchAdminStats = (token) => axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
// Categories
export const fetchCategories = () => axios.get(`${API}/categories`).then(r => r.data);
// Items
export const fetchItems = (params) => axios.get(`${API}/items`, { params }).then(r => r.data);
export const fetchItem = (slug) => axios.get(`${API}/items/${slug}`).then(r => r.data);
// Admin CRUD
const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
export const adminCreateLocation = (fd, token) => axios.post(`${API}/locations`, fd, { headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const adminUpdateLocation = (id, fd, token) => axios.put(`${API}/locations/${id}`, fd, { headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const adminDeleteLocation = (id, token) => axios.delete(`${API}/locations/${id}`, { headers: authHeader(token) }).then(r => r.data);
export const adminCreateCategory = (fd, token) => axios.post(`${API}/categories`, fd, { headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const adminUpdateCategory = (id, fd, token) => axios.put(`${API}/categories/${id}`, fd, { headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const adminDeleteCategory = (id, token) => axios.delete(`${API}/categories/${id}`, { headers: authHeader(token) }).then(r => r.data);
export const adminCreateItem = (fd, token) => axios.post(`${API}/items`, fd, { headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const adminUpdateItem = (id, fd, token) => axios.put(`${API}/items/${id}`, fd, { headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const adminDeleteItem = (id, token) => axios.delete(`${API}/items/${id}`, { headers: authHeader(token) }).then(r => r.data);
export const adminDeleteMedia = (itemId, mediaId, token) => axios.delete(`${API}/items/${itemId}/media/${mediaId}`, { headers: authHeader(token) }).then(r => r.data);
