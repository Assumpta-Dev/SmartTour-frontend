import axios from 'axios';
const API = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:4000/api';

export const askAI = (question: string, objectId: string): Promise<string> =>
  axios.post(`${API}/ai/chat`, { question, objectId }).then(r => r.data.answer);
