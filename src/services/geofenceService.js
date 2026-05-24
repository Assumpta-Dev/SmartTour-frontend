import axios from 'axios';
const API = import.meta.env?.VITE_API_URL ?? 'http://localhost:4000/api';
export const checkZone = (lat, lng) => axios.post(`${API}/geofence/check`, { lat, lng }).then(r => r.data);
