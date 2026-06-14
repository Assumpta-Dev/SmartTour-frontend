import axios from 'axios';
const API = import.meta.env?.VITE_API_URL ?? 'http://localhost:4000/api';
export const checkGeofence = (lat, lng) => axios.post(`${API}/geofence/check`, { lat, lng }).then(r => r.data);
export const fetchZones = () => axios.get(`${API}/zones`).then(r => r.data);
export const adminCreateZone = (data, token) => axios.post(`${API}/zones`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
export const adminUpdateZone = (id, data, token) => axios.put(`${API}/zones/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
export const adminDeleteZone = (id, token) => axios.delete(`${API}/zones/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
