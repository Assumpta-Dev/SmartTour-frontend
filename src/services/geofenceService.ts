import axios from 'axios';
const API = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:4000/api';

export const checkZone = (lat: number, lng: number) =>
  axios.post(`${API}/geofence/check`, { lat, lng }).then(r => r.data);
