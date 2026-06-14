import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:4000/api';

export interface Zone {
  id: number;
  zoneName: string;
  radius: number;
  latitude: number;
  longitude: number;
  triggerAudio: string | null;
}

export const checkGeofence = (lat: number, lng: number): Promise<Zone[]> =>
  axios.post(`${API}/geofence/check`, { lat, lng }).then(r => r.data);

export const fetchZones = (): Promise<Zone[]> =>
  axios.get(`${API}/zones`).then(r => r.data);

export const adminCreateZone = (data: Omit<Zone, 'id'>, token: string): Promise<Zone> =>
  axios.post(`${API}/zones`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);

export const adminUpdateZone = (id: number, data: Partial<Omit<Zone, 'id'>>, token: string): Promise<Zone> =>
  axios.put(`${API}/zones/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);

export const adminDeleteZone = (id: number, token: string): Promise<void> =>
  axios.delete(`${API}/zones/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
