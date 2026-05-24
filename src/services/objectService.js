import axios from 'axios';
import { cacheGet, cacheSet } from '../utils/cache';
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
// Returns cached value instantly, fetches fresh data and updates cache in background.
// If offline and cache exists, resolves with cache. If offline and no cache, rejects.
function withCache(key, fetcher) {
    const cached = cacheGet(key);
    const fresh = fetcher().then(data => { cacheSet(key, data); return data; });
    return cached ? Promise.resolve(cached) : fresh;
}
export const fetchObjects = (page = 1, limit = 20, type) => withCache(`objects_${page}_${limit}_${type ?? ''}`, () => axios.get(`${API}/objects`, { params: { page, limit, type } }).then(r => r.data));
export const fetchObject = (id) => withCache(`object_${id}`, () => axios.get(`${API}/objects/${id}`).then(r => r.data));
export const fetchNearby = (lat, lng, radius = 200) => withCache(`nearby_${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`, () => axios.get(`${API}/objects/nearby`, { params: { lat, lng, radius } }).then(r => r.data));
export const fetchByNfc = (nfcId) => withCache(`nfc_${nfcId}`, () => axios.get(`${API}/objects/nfc/${nfcId}`).then(r => r.data));
export const fetchByQr = (qrCode) => withCache(`qr_${qrCode}`, () => axios.get(`${API}/objects/qr/${qrCode}`).then(r => r.data));
export const adminLogin = (username, password) => axios.post(`${API}/admin/login`, { username, password }).then(r => r.data);
export const createObject = (formData, token) => axios.post(`${API}/objects`, formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
}).then(r => r.data);
export const updateObject = (id, formData, token) => axios.put(`${API}/objects/${id}`, formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
}).then(r => r.data);
export const deleteObject = (id, token) => axios.delete(`${API}/objects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
}).then(r => r.data);
