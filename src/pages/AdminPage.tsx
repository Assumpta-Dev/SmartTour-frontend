import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  HiOutlineLockClosed, HiOutlineLogout, HiOutlinePencil, HiOutlineTrash,
  HiOutlinePlus, HiChevronLeft, HiChevronRight, HiDownload, HiX,
  HiPlay, HiPause,
} from 'react-icons/hi';
import { MdNfc, MdQrCode } from 'react-icons/md';
import {
  adminLogin, fetchObjects, createObject, updateObject, deleteObject,
  type TourObject,
} from '../services/objectService';

const PAGE_SIZE = 5;
const BASE_URL  = window.location.origin;

type FormState = Partial<TourObject & { imageFile?: File; audioFile?: File }>;
const EMPTY: FormState = { name:'', type:'', description:'', nfcId:'', qrCode:'', audioUrl:'' };

const qrUrl  = (o: TourObject) => o.qrCode ? `${BASE_URL}/qr/${o.qrCode}` : `${BASE_URL}/object/${o.id}`;
const nfcUrl = (o: TourObject) => o.nfcId  ? `${BASE_URL}/nfc/${o.nfcId}` : null;

/* ── Mini audio player used inside preview modal ── */
function PreviewAudio({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!ref.current) return;
    playing ? ref.current.pause() : ref.current.play();
    setPlaying(p => !p);
  };
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 w-full">
      <button onClick={toggle}
        className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 hover:bg-blue-400 transition">
        {playing ? <HiPause size={18} /> : <HiPlay size={18} className="ml-0.5" />}
      </button>
      <span className="text-sm text-slate-600">{playing ? 'Playing…' : 'Play narration'}</span>
      <audio ref={ref} src={src} onEnded={() => setPlaying(false)} />
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken]       = useState(() => sessionStorage.getItem('admin_token') ?? '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [objects, setObjects]   = useState<TourObject[]>([]);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState<FormState>(EMPTY);
  const [editing, setEditing]   = useState<number | null>(null);
  const [formKey, setFormKey]   = useState(0);
  const [msg, setMsg]           = useState('');
  const [page, setPage]         = useState(1);
  const [preview, setPreview]   = useState<TourObject | null>(null);

  const load = useCallback(() =>
    fetchObjects(1, 500).then(r => setObjects(r.data)).catch(() => null), []);

  useEffect(() => { if (token) load(); }, [token, load]);

  const handleLogin = async () => {
    setLoginErr('');
    try {
      const { token: t } = await adminLogin(username, password);
      sessionStorage.setItem('admin_token', t); setToken(t);
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? '';
      if (!e?.response) {
        setLoginErr('Cannot reach server. Make sure the backend is running.');
      } else {
        setLoginErr(msg || `Error ${e.response.status}`);
      }
    }
  };

  const handleLogout = () => { sessionStorage.removeItem('admin_token'); setToken(''); };

  const handleEdit = (obj: TourObject) => {
    setPreview(null);
    setEditing(obj.id);
    setForm({ name: obj.name, type: obj.type, description: obj.description,
      latitude: obj.latitude, longitude: obj.longitude,
      nfcId: obj.nfcId ?? '', qrCode: obj.qrCode ?? '', audioUrl: obj.audioUrl ?? '' });
    setFormKey(k => k + 1);
    setMsg('');
  };

  const handleCancel = () => { setEditing(null); setForm(EMPTY); setFormKey(k => k + 1); setMsg(''); };

  const handleSubmit = async () => {
    setLoading(true); setMsg('');
    try {
      const fd = new FormData();
      (['name','type','description','latitude','longitude','nfcId','qrCode','audioUrl'] as (keyof TourObject)[])
        .forEach(f => { if (form[f] != null && form[f] !== '') fd.append(f, String(form[f])); });
      if (form.imageFile) fd.append('image', form.imageFile);
      if (form.audioFile) fd.append('audio', form.audioFile);
      editing !== null
        ? await updateObject(editing, fd, token)
        : await createObject(fd, token);
      setMsg(editing !== null ? 'Updated.' : 'Created.');
      handleCancel(); load();
    } catch (e: any) { setMsg(e.response?.data?.error ?? 'Error saving.'); }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this object?')) return;
    try { await deleteObject(id, token); setMsg('Deleted.'); load(); }
    catch { setMsg('Failed to delete.'); }
  };

  const downloadQr = (obj: TourObject) => {
    const c = document.querySelector<HTMLCanvasElement>(`#qrdl-${obj.id}`);
    if (!c) return;
    Object.assign(document.createElement('a'), { href: c.toDataURL('image/png'), download: `${obj.name}-qr.png` }).click();
  };

  const totalPages = Math.ceil(objects.length / PAGE_SIZE);
  const paged      = objects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Login ── */
  if (!token) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
            <HiOutlineLockClosed size={26} className="text-blue-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Admin Login</h1>
          <p className="text-xs text-slate-400 mt-1">Smart Tourism Management</p>
        </div>
        <div className="space-y-3">
          <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
            placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <input type="password"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"
            placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          {loginErr && <p className="text-red-400 text-xs">{loginErr}</p>}
          <button onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-400 transition">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white';

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-bold text-slate-800 text-sm">Admin Dashboard</h1>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition">
          <HiOutlineLogout size={15} /> Logout
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4 max-w-2xl w-full mx-auto">

        {/* ── Form ── */}
        <div className="bg-white rounded-2xl shadow-sm flex-shrink-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2 text-sm font-semibold text-slate-700">
            {editing !== null
              ? <><HiOutlinePencil size={14} className="text-blue-500" /> Edit Object</>
              : <><HiOutlinePlus   size={14} className="text-blue-500" /> New Object</>}
          </div>
          <div className="p-4 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <input key={`n${formKey}`}  className={inp} placeholder="Name *"       value={form.name ?? ''}        onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              <select key={`t${formKey}`} className={inp}                             value={form.type ?? ''}        onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                <option value="">Type *</option>
                <option value="animal">Animal</option>
                <option value="bird">Bird</option>
                <option value="tree">Tree</option>
                <option value="landmark">Landmark</option>
              </select>
              <textarea key={`d${formKey}`} className={`${inp} col-span-2 resize-none`} placeholder="Description *" rows={4} value={form.description ?? ''} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
              <input key={`la${formKey}`} className={inp} placeholder="Latitude *"   type="number" value={form.latitude  ?? ''} onChange={e => setForm(f=>({...f,latitude:parseFloat(e.target.value)}))} />
              <input key={`lo${formKey}`} className={inp} placeholder="Longitude *"  type="number" value={form.longitude ?? ''} onChange={e => setForm(f=>({...f,longitude:parseFloat(e.target.value)}))} />
              <input key={`nf${formKey}`} className={inp} placeholder="NFC ID"       value={form.nfcId   ?? ''} onChange={e => setForm(f=>({...f,nfcId:e.target.value}))} />
              <input key={`qr${formKey}`} className={inp} placeholder="QR Code"      value={form.qrCode  ?? ''} onChange={e => setForm(f=>({...f,qrCode:e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Image</label>
                <input key={`im${formKey}`} type="file" accept="image/*" className="text-xs text-slate-500 w-full"
                  onChange={e => setForm(f=>({...f,imageFile:e.target.files?.[0]}))} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Audio</label>
                <input key={`au${formKey}`} type="file" accept="audio/*" className="text-xs text-slate-500 w-full"
                  onChange={e => setForm(f=>({...f,audioFile:e.target.files?.[0]}))} />
              </div>
            </div>
            <input key={`au2${formKey}`} className={inp} placeholder="Or paste audio URL"
              value={form.audioUrl ?? ''} onChange={e => setForm(f=>({...f,audioUrl:e.target.value}))} />

            {msg && <p className={`text-xs ${msg.includes('Error')||msg.includes('Failed') ? 'text-red-400':'text-green-500'}`}>{msg}</p>}

            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-400 disabled:opacity-50 transition">
                {loading ? 'Saving…' : editing !== null ? 'Update' : 'Create'}
              </button>
              {editing !== null && (
                <button onClick={handleCancel}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Paginated list ── */}
        <div className="flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* List header */}
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between flex-shrink-0">
            <span className="text-sm font-semibold text-slate-700">Objects <span className="text-slate-400 font-normal">({objects.length})</span></span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="p-1 disabled:opacity-30 hover:text-blue-500 transition rounded-lg hover:bg-slate-50">
                <HiChevronLeft size={16} />
              </button>
              <span className="px-1">{page} / {Math.max(1, totalPages)}</span>
              <button onClick={() => setPage(p => Math.min(Math.max(1, totalPages), p+1))} disabled={page>=Math.max(1,totalPages)}
                className="p-1 disabled:opacity-30 hover:text-blue-500 transition rounded-lg hover:bg-slate-50">
                <HiChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50">
            {objects.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-12">No objects yet.</p>
            )}
            {paged.map(obj => (
              <div key={obj.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition">

                {/* Thumbnail */}
                {obj.imageUrl
                  ? <img src={obj.imageUrl} alt={obj.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
                }

                {/* Name + type */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{obj.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{obj.type}</p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setPreview(obj)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition font-medium">
                    Preview
                  </button>
                  <button onClick={() => handleEdit(obj)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition">
                    <HiOutlinePencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(obj.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400 transition">
                    <HiOutlineTrash size={15} />
                  </button>
                </div>

                {/* Hidden QR canvas for download */}
                <div className="hidden">
                  <QRCodeCanvas id={`qrdl-${obj.id}`} value={qrUrl(obj)} size={512} level="H" includeMargin />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>

            {/* Image */}
            <div className="relative">
              {preview.imageUrl
                ? <img src={preview.imageUrl} alt={preview.name} className="w-full h-48 object-cover rounded-t-3xl" />
                : <div className="w-full h-32 bg-slate-100 rounded-t-3xl" />
              }
              <button onClick={() => setPreview(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition">
                <HiX size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Name + type */}
              <div>
                <h2 className="text-lg font-bold text-slate-800">{preview.name}</h2>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{preview.type}</p>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">{preview.description}</p>

              {/* Audio */}
              {preview.audioUrl
                ? <PreviewAudio src={preview.audioUrl} />
                : (
                  <div className="flex items-center gap-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <HiPlay size={16} className="text-slate-300 ml-0.5" />
                    </div>
                    <span className="text-sm text-slate-400">No audio — add one by editing this object</span>
                  </div>
                )
              }

              {/* NFC link */}
              {nfcUrl(preview) && (
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                    <MdNfc size={15} /> NFC Tag URL
                  </p>
                  <p className="text-xs text-slate-500">Copy this URL and write it to a physical NFC card:</p>
                  <code className="block text-xs bg-white border border-blue-100 rounded-xl px-3 py-2 text-blue-600 break-all select-all">
                    {nfcUrl(preview)}
                  </code>
                </div>
              )}

              {/* QR code */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col items-center gap-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 self-start">
                  <MdQrCode size={15} /> QR Code
                </p>
                <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                  <QRCodeCanvas value={qrUrl(preview)} size={160} level="H" includeMargin />
                </div>
                <code className="text-xs text-slate-400 break-all text-center">{qrUrl(preview)}</code>
                <button onClick={() => downloadQr(preview)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition w-full justify-center">
                  <HiDownload size={15} /> Download QR
                </button>
              </div>

              {/* Edit shortcut */}
              <button onClick={() => handleEdit(preview)}
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
                <HiOutlinePencil size={14} /> Edit this object
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
