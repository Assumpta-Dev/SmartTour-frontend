import axios from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export interface TourObject {
  id: number;
  name: string;
  type: string;
  description: string;
  imageUrl: string | null;
  audioUrl: string | null;
  latitude: number;
  longitude: number;
  nfcId: string | null;
  qrCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedObjects {
  data: TourObject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Returns cached value instantly, fetches fresh data and updates cache in background.
// If offline and cache exists, resolves with cache. If offline and no cache, rejects.
function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cacheGet<T>(key);
  const fresh  = fetcher().then(data => { cacheSet(key, data); return data; });
  return cached ? Promise.resolve(cached) : fresh;
}

export const fetchObjects = (page = 1, limit = 20, type?: string): Promise<PaginatedObjects> =>
  withCache(`objects_${page}_${limit}_${type ?? ''}`,
    () => axios.get(`${API}/objects`, { params: { page, limit, type } }).then(r => r.data));

export const fetchObject = (id: string | number): Promise<TourObject> =>
  withCache(`object_${id}`,
    () => axios.get(`${API}/objects/${id}`).then(r => r.data));

export const fetchNearby = (lat: number, lng: number, radius = 200): Promise<TourObject[]> =>
  withCache(`nearby_${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`,
    () => axios.get(`${API}/objects/nearby`, { params: { lat, lng, radius } }).then(r => r.data));

export const fetchByNfc = (nfcId: string): Promise<TourObject> =>
  withCache(`nfc_${nfcId}`,
    () => axios.get(`${API}/objects/nfc/${nfcId}`).then(r => r.data));

export const fetchByQr = (qrCode: string): Promise<TourObject> =>
  withCache(`qr_${qrCode}`,
    () => axios.get(`${API}/objects/qr/${qrCode}`).then(r => r.data));

export const adminLogin = (username: string, password: string): Promise<{ token: string }> =>
  axios.post(`${API}/admin/login`, { username, password }).then(r => r.data);

export const createObject = (formData: FormData, token: string): Promise<TourObject> =>
  axios.post(`${API}/objects`, formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    timeout: 0,
  }).then(r => r.data);

export const updateObject = (id: number, formData: FormData, token: string): Promise<TourObject> =>
  axios.put(`${API}/objects/${id}`, formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    timeout: 0,
  }).then(r => r.data);

export const deleteObject = (id: number, token: string): Promise<void> =>
  axios.delete(`${API}/objects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.data);
