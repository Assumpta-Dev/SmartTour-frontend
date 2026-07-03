import axios from 'axios';

const API = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:4000/api';

export interface Location {
  id: number; name: string; slug: string; description: string;
  coverImage: string | null; videoUrl: string | null;
  latitude: number | null; longitude: number | null;
  featured: boolean; _count?: { items: number };
  items?: Item[];
}

export interface Category {
  id: number; name: string; slug: string; icon: string | null;
  description: string | null;
  images: { id: number; url: string }[];
  _count?: { items: number };
}

export interface MediaItem {
  id: number; url: string; type: string; caption: string | null; order: number;
}

export interface Item {
  id: number; name: string; slug: string; description: string;
  audioUrl: string | null; videoUrl: string | null;
  duration: string | null; facts: string | null;
  habitat: string | null; conservation: string | null;
  rating: number; featured: boolean; viewCount: number;
  location: Location; category: Category;
  media: MediaItem[];
  related?: Item[];
}

export interface PaginatedItems {
  data: Item[]; total: number; page: number; limit: number; totalPages: number;
}

// Locations
export const fetchLocations = (featured?: boolean): Promise<Location[]> =>
  axios.get(`${API}/locations`, { params: { ...(featured ? { featured: true } : {}), includeCounts: true } }).then(r => r.data);

export const fetchLocation = (slug: string): Promise<Location> =>
  axios.get(`${API}/locations/${slug}`).then(r => r.data);

// Nearby locations (GPS explorer)
export const fetchNearbyLocations = (lat: number, lng: number, radius = 5000): Promise<(Location & { distance: number })[]> =>
  axios.get(`${API}/nearby`, { params: { lat, lng, radius } }).then(r => r.data);

// Admin stats
export const fetchAdminStats = (token: string): Promise<{
  locations: number; categories: number; items: number;
  media: number; zones: number; objects: number;
  topItems: { id: number; name: string; slug: string; viewCount: number; category: { name: string } }[];
}> => axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);

// Categories
export const fetchCategories = (): Promise<Category[]> =>
  axios.get(`${API}/categories`).then(r => r.data);

// Items
export const fetchItems = (params: {
  page?: number; limit?: number;
  locationId?: number; categoryId?: number; search?: string;
}): Promise<PaginatedItems> =>
  axios.get(`${API}/items`, { params }).then(r => r.data);

export const fetchItem = (slug: string): Promise<Item> =>
  axios.get(`${API}/items/${slug}`).then(r => r.data);

// Admin CRUD
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

// Uploads a video file directly to Cloudinary (bypasses backend/Render timeout).
// Returns the Cloudinary URL string.
export async function directUploadToCloudinary(
  file: File,
  token: string,
  folder = 'smart-tourism/videos',
  onProgress?: (p: number) => void,
): Promise<string> {
  const { data: sig } = await axios.get(`${API}/upload/signature`, {
    headers: authHeader(token),
    params: { folder, resource_type: 'video' },
  });
  const fd = new FormData();
  fd.append('file',          file);
  fd.append('api_key',       sig.api_key);
  fd.append('timestamp',     String(sig.timestamp));
  fd.append('signature',     sig.signature);
  fd.append('folder',        sig.folder);
  fd.append('resource_type', sig.resource_type);
  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${sig.resource_type}/upload`,
    fd,
    { timeout: 0, onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))) },
  );
  return data.secure_url;
}

export const adminCreateLocation = (fd: FormData, token: string, onProgress?: (p: number) => void) =>
  axios.post(`${API}/locations`, fd, {
    headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
  }).then(r => r.data);

export const adminUpdateLocation = (id: number, fd: FormData, token: string, onProgress?: (p: number) => void) =>
  axios.put(`${API}/locations/${id}`, fd, {
    headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
  }).then(r => r.data);

export const adminDeleteLocation = (id: number, token: string) =>
  axios.delete(`${API}/locations/${id}`, { headers: authHeader(token) }).then(r => r.data);

export const adminCreateCategory = (fd: FormData, token: string, onProgress?: (p: number) => void) =>
  axios.post(`${API}/categories`, fd, {
    headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
  }).then(r => r.data);

export const adminUpdateCategory = (id: number, fd: FormData, token: string, onProgress?: (p: number) => void) =>
  axios.put(`${API}/categories/${id}`, fd, {
    headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
  }).then(r => r.data);

export const adminDeleteCategory = (id: number, token: string) =>
  axios.delete(`${API}/categories/${id}`, { headers: authHeader(token) }).then(r => r.data);

export const adminCreateItem = (fd: FormData, token: string, onProgress?: (p: number) => void) =>
  axios.post(`${API}/items`, fd, {
    headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
  }).then(r => r.data);

export const adminUpdateItem = (id: number, fd: FormData, token: string, onProgress?: (p: number) => void) =>
  axios.put(`${API}/items/${id}`, fd, {
    headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
  }).then(r => r.data);

export const adminDeleteItem = (id: number, token: string) =>
  axios.delete(`${API}/items/${id}`, { headers: authHeader(token) }).then(r => r.data);

export const adminDeleteMedia = (itemId: number, mediaId: number, token: string) =>
  axios.delete(`${API}/items/${itemId}/media/${mediaId}`, { headers: authHeader(token) }).then(r => r.data);
