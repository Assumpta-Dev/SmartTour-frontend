import { useState, useEffect } from 'react';
import {
  HiOutlineLockClosed, HiOutlineUser, HiEye, HiEyeOff,
  HiOutlineLogout, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus,
  HiChevronLeft, HiChevronRight, HiOutlinePhotograph, HiOutlineMusicNote,
  HiOutlineFilm, HiOutlineLocationMarker, HiCheckCircle, HiXCircle, HiOutlineTag,
} from 'react-icons/hi';
import { MdNfc, MdQrCode, MdPets, MdPark, MdAccountBalance, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage } from 'react-icons/gi';
import { TbLeaf, TbMapPin } from 'react-icons/tb';
import { adminLogin, fetchObjects, createObject, updateObject, deleteObject, type TourObject } from '../services/objectService';
import {
  fetchLocations, fetchCategories, fetchItems,
  adminCreateLocation, adminUpdateLocation, adminDeleteLocation,
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminCreateItem, adminUpdateItem, adminDeleteItem,
  type Location, type Category, type Item,
} from '../services/tourismService';
import { Footer } from './HomePage';

type Tab = 'locations' | 'categories' | 'items' | 'objects';

const TAB_CONFIG: { key: Tab; label: string; icon: JSX.Element }[] = [
  { key: 'locations',  label: 'Destinations', icon: <TbMapPin size={16} />        },
  { key: 'categories', label: 'Categories',   icon: <HiOutlineTag size={16} />         },
  { key: 'items',      label: 'Features',     icon: <MdOutlinePlace size={16} />   },
  { key: 'objects',    label: 'NFC Objects',  icon: <MdNfc size={16} />            },
];

const TYPE_ICON: Record<string, JSX.Element> = {
  animal:   <MdPets size={18} className="text-blue-500" />,
  bird:     <GiBirdCage size={18} className="text-blue-500" />,
  tree:     <TbLeaf size={18} className="text-blue-500" />,
  landmark: <MdAccountBalance size={18} className="text-blue-500" />,
};

const inp = 'w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white text-slate-800 placeholder:text-slate-400';
const label = 'text-xs font-semibold text-slate-500 mb-1 block';

export default function AdminPage() {
  const [token,    setToken]    = useState(() => sessionStorage.getItem('admin_token') ?? '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [tab,      setTab]      = useState<Tab>('locations');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const [objects,    setObjects]    = useState<TourObject[]>([]);
  const [locations,  setLocations]  = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items,      setItems]      = useState<Item[]>([]);

  const [locForm,  setLocForm]  = useState<any>({});
  const [catForm,  setCatForm]  = useState<any>({});
  const [itemForm, setItemForm] = useState<any>({});
  const [objForm,  setObjForm]  = useState<any>({});
  const [editingLoc,  setEditingLoc]  = useState<number | null>(null);
  const [editingCat,  setEditingCat]  = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingObj,  setEditingObj]  = useState<number | null>(null);

  // pagination
  const [locPage,  setLocPage]  = useState(1);
  const [itemPage, setItemPage] = useState(1);
  const [objPage,  setObjPage]  = useState(1);
  const PAGE = 6;

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  useEffect(() => {
    if (!token) return;
    fetchLocations().then(setLocations).catch(() => null);
    fetchCategories().then(setCategories).catch(() => null);
    fetchItems({ limit: 200 }).then(r => setItems(r.data)).catch(() => null);
    fetchObjects(1, 200).then(r => setObjects(r.data)).catch(() => null);
  }, [token]);

  const handleLogin = async () => {
    setLoginErr('');
    try {
      const { token: t } = await adminLogin(username, password);
      sessionStorage.setItem('admin_token', t);
      setToken(t);
    } catch (e: any) {
      const m = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? '';
      setLoginErr(!e?.response ? 'Cannot reach server. Is the backend running?' : m || 'Invalid credentials.');
    }
  };

  const handleLogout = () => { sessionStorage.removeItem('admin_token'); setToken(''); };

  // ── handlers ──────────────────────────────────────────────────────────────
  const submitLoc = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(locForm).forEach(([k, v]) => { if (k !== 'imageFile' && v != null) fd.append(k, String(v)); });
      if (locForm.imageFile) fd.append('image', locForm.imageFile);
      editingLoc !== null ? await adminUpdateLocation(editingLoc, fd, token) : await adminCreateLocation(fd, token);
      flash(editingLoc !== null ? 'Destination updated.' : 'Destination created.');
      setLocForm({}); setEditingLoc(null);
      fetchLocations().then(setLocations);
    } catch (e: any) { flash(e.response?.data?.error ?? 'Error saving.'); }
    setLoading(false);
  };

  const submitCat = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      if (catForm.name)        fd.append('name', catForm.name);
      if (catForm.slug)        fd.append('slug', catForm.slug);
      if (catForm.description) fd.append('description', catForm.description);
      if (catForm.imageFiles)  Array.from(catForm.imageFiles as FileList).forEach((f: any) => fd.append('images', f));
      editingCat !== null ? await adminUpdateCategory(editingCat, fd, token) : await adminCreateCategory(fd, token);
      flash(editingCat !== null ? 'Category updated.' : 'Category created.');
      setCatForm({}); setEditingCat(null);
      fetchCategories().then(setCategories);
    } catch (e: any) { flash(e.response?.data?.error ?? 'Error saving.'); }
    setLoading(false);
  };

  const submitItem = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(itemForm).forEach(([k, v]) => {
        if (k !== 'imageFiles' && k !== 'audioFile' && v != null) fd.append(k, String(v));
      });
      if (itemForm.audioFile) fd.append('audio', itemForm.audioFile);
      if (itemForm.imageFiles) Array.from(itemForm.imageFiles as FileList).forEach((f: any) => fd.append('images', f));
      editingItem !== null ? await adminUpdateItem(editingItem, fd, token) : await adminCreateItem(fd, token);
      flash(editingItem !== null ? 'Feature updated.' : 'Feature created.');
      setItemForm({}); setEditingItem(null);
      fetchItems({ limit: 200 }).then(r => setItems(r.data));
      fetchLocations().then(setLocations);
    } catch (e: any) { flash(e.response?.data?.error ?? 'Error saving.'); }
    setLoading(false);
  };

  const submitObj = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(objForm).forEach(([k, v]) => { if (k !== 'imageFile' && k !== 'audioFile' && v != null) fd.append(k, String(v)); });
      if (objForm.imageFile) fd.append('image', objForm.imageFile);
      if (objForm.audioFile) fd.append('audio', objForm.audioFile);
      editingObj !== null ? await updateObject(editingObj, fd, token) : await createObject(fd, token);
      flash(editingObj !== null ? 'Object updated.' : 'Object created.');
      setObjForm({}); setEditingObj(null);
      fetchObjects(1, 200).then(r => setObjects(r.data));
    } catch (e: any) { flash(e.response?.data?.error ?? 'Error saving.'); }
    setLoading(false);
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!token) return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-lg p-8">

          {/* Icon header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
              <HiOutlineLockClosed size={28} className="text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
            <p className="text-sm text-slate-400 mt-1">Smart Tourism Management</p>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div className="relative">
              <HiOutlineUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-400 text-slate-800 placeholder:text-slate-400"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {/* Password with show/hide */}
            <div className="relative">
              <HiOutlineLockClosed size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full border border-slate-200 rounded-2xl pl-10 pr-11 py-3 text-sm outline-none focus:border-blue-400 text-slate-800 placeholder:text-slate-400"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition"
              >
                {showPw ? <HiEyeOff size={17} /> : <HiEye size={17} />}
              </button>
            </div>

            {loginErr && (
              <p className="flex items-center gap-2 text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl">
                <HiXCircle size={14} /> {loginErr}
              </p>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold transition shadow-sm shadow-blue-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  const isErr = msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed');

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
            <TbMapPin size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-800">Admin Dashboard</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition px-3 py-2 rounded-xl hover:bg-red-50"
        >
          <HiOutlineLogout size={16} /> Logout
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-4 flex gap-1 overflow-x-auto">
        {TAB_CONFIG.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
              tab === t.key
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium ${
          isErr ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
        }`}>
          {isErr ? <HiXCircle size={16} /> : <HiCheckCircle size={16} />}
          {msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto w-full p-4 space-y-5 flex-1">

        {/* ── DESTINATIONS ── */}
        {tab === 'locations' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-3">
                {editingLoc !== null
                  ? <><HiOutlinePencil size={15} className="text-blue-500" /> Edit Destination</>
                  : <><HiOutlinePlus size={15} className="text-blue-500" /> Add Destination</>}
              </div>
              <input className={inp} placeholder="Name *" value={locForm.name ?? ''} onChange={e => setLocForm((f: any) => ({ ...f, name: e.target.value }))} />
              <textarea className={inp} rows={3} placeholder="Description *" value={locForm.description ?? ''} onChange={e => setLocForm((f: any) => ({ ...f, description: e.target.value }))} />
              <input className={inp} placeholder="Video URL" value={locForm.videoUrl ?? ''} onChange={e => setLocForm((f: any) => ({ ...f, videoUrl: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inp} placeholder="Latitude" type="number" value={locForm.latitude ?? ''} onChange={e => setLocForm((f: any) => ({ ...f, latitude: e.target.value }))} />
                <input className={inp} placeholder="Longitude" type="number" value={locForm.longitude ?? ''} onChange={e => setLocForm((f: any) => ({ ...f, longitude: e.target.value }))} />
              </div>
              <div>
                <label className={label}><HiOutlinePhotograph size={12} className="inline mr-1" />Cover Image</label>
                <input type="file" accept="image/*" className="text-sm text-slate-500 w-full" onChange={e => setLocForm((f: any) => ({ ...f, imageFile: e.target.files?.[0] }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input type="checkbox" className="accent-blue-500" checked={locForm.featured === 'true' || locForm.featured === true} onChange={e => setLocForm((f: any) => ({ ...f, featured: e.target.checked ? 'true' : 'false' }))} />
                Featured on homepage
              </label>
              <div className="flex gap-2 pt-1">
                <button onClick={submitLoc} disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 transition">
                  {loading ? 'Saving…' : editingLoc !== null ? 'Update' : 'Create'}
                </button>
                {editingLoc !== null && <button onClick={() => { setEditingLoc(null); setLocForm({}); }} className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-500 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </div>

            {/* Locations list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Destinations ({locations.length})</p>
                {Math.ceil(locations.length / PAGE) > 1 && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <button onClick={() => setLocPage(p => Math.max(1, p - 1))} disabled={locPage === 1} className="p-1 disabled:opacity-30 hover:text-blue-500"><HiChevronLeft size={15} /></button>
                    {locPage} / {Math.ceil(locations.length / PAGE)}
                    <button onClick={() => setLocPage(p => Math.min(Math.ceil(locations.length / PAGE), p + 1))} disabled={locPage === Math.ceil(locations.length / PAGE)} className="p-1 disabled:opacity-30 hover:text-blue-500"><HiChevronRight size={15} /></button>
                  </div>
                )}
              </div>
              {locations.slice((locPage - 1) * PAGE, locPage * PAGE).map(loc => (
                <div key={loc.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-3">
                  {loc.coverImage
                    ? <img src={loc.coverImage} alt={loc.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                    : <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0"><MdPark size={24} className="text-blue-300" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm">{loc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{loc.description}</p>
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1"><HiOutlineLocationMarker size={11} /> {loc._count?.items ?? 0} features</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => { setEditingLoc(loc.id); setLocForm({ name: loc.name, description: loc.description, videoUrl: loc.videoUrl ?? '', latitude: loc.latitude, longitude: loc.longitude, featured: String(loc.featured) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1 text-xs text-blue-500 hover:underline"><HiOutlinePencil size={12} /> Edit</button>
                    <button onClick={async () => { if (!confirm('Delete this destination?')) return; await adminDeleteLocation(loc.id, token); fetchLocations().then(setLocations); flash('Deleted.'); }} className="flex items-center gap-1 text-xs text-red-400 hover:underline"><HiOutlineTrash size={12} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CATEGORIES ── */}
        {tab === 'categories' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-3">
                {editingCat !== null
                  ? <><HiOutlinePencil size={15} className="text-blue-500" /> Edit Category</>
                  : <><HiOutlinePlus size={15} className="text-blue-500" /> Add Category</>}
              </div>
              <input className={inp} placeholder="Name * (e.g. Birds)" value={catForm.name ?? ''} onChange={e => setCatForm((f: any) => ({ ...f, name: e.target.value }))} />
              <input className={inp} placeholder="Slug * (e.g. birds — lowercase, no spaces)" value={catForm.slug ?? ''} onChange={e => setCatForm((f: any) => ({ ...f, slug: e.target.value }))} />
              <textarea className={inp} rows={3} placeholder="Short description of this category" value={catForm.description ?? ''} onChange={e => setCatForm((f: any) => ({ ...f, description: e.target.value }))} />
              <div>
                <label className={label}><HiOutlinePhotograph size={12} className="inline mr-1" />Category Images (multiple allowed)</label>
                <input
                  type="file" accept="image/*" multiple
                  className="text-sm text-slate-500 w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-500 hover:file:bg-blue-100"
                  onChange={e => setCatForm((f: any) => ({ ...f, imageFiles: e.target.files }))}
                />
                <p className="text-xs text-slate-400 mt-1">These images will appear in a slideshow when tourists browse this category.</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={submitCat} disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 transition">
                  {loading ? 'Saving…' : editingCat !== null ? 'Update' : 'Create'}
                </button>
                {editingCat !== null && <button onClick={() => { setEditingCat(null); setCatForm({}); }} className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-500 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </div>

            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                  <div className="flex gap-3">
                    {/* Image strip or placeholder */}
                    {cat.images?.length > 0
                      ? <div className="flex gap-1.5 flex-shrink-0">
                          {cat.images.slice(0, 3).map((img, i) => (
                            <img key={i} src={img.url} alt={cat.name} className="w-14 h-14 rounded-2xl object-cover" />
                          ))}
                          {cat.images.length > 3 && (
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-400">
                              +{cat.images.length - 3}
                            </div>
                          )}
                        </div>
                      : <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <HiOutlinePhotograph size={22} className="text-blue-300" />
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{cat.name}</p>
                      {cat.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{cat.description}</p>}
                      <p className="text-xs text-blue-400 mt-1">{cat._count?.items ?? 0} features</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditingCat(cat.id); setCatForm({ name: cat.name, slug: cat.slug ?? '', description: cat.description ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                        <HiOutlinePencil size={12} /> Edit
                      </button>
                      <button
                        onClick={async () => { if (!confirm('Delete this category?')) return; await adminDeleteCategory(cat.id, token); fetchCategories().then(setCategories); flash('Deleted.'); }}
                        className="flex items-center gap-1 text-xs text-red-400 hover:underline">
                        <HiOutlineTrash size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── FEATURES (ITEMS) ── */}
        {tab === 'items' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-3">
                {editingItem !== null
                  ? <><HiOutlinePencil size={15} className="text-blue-500" /> Edit Feature</>
                  : <><HiOutlinePlus size={15} className="text-blue-500" /> Add Feature</>}
              </div>
              <input className={inp} placeholder="Name *" value={itemForm.name ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, name: e.target.value }))} />
              <textarea className={inp} rows={3} placeholder="Description *" value={itemForm.description ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className={inp} value={itemForm.locationId ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, locationId: e.target.value }))}>
                  <option value="">Destination *</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <select className={inp} value={itemForm.categoryId ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">Category *</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <textarea className={inp} rows={2} placeholder="Habitat" value={itemForm.habitat ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, habitat: e.target.value }))} />
              <textarea className={inp} rows={2} placeholder="Conservation status" value={itemForm.conservation ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, conservation: e.target.value }))} />
              <textarea className={inp} rows={2} placeholder="Interesting facts (one per line)" value={itemForm.facts ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, facts: e.target.value }))} />
              <input className={inp} placeholder="Duration (e.g. 2–3 hours)" value={itemForm.duration ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, duration: e.target.value }))} />
              <div className="space-y-3">
                <div>
                  <label className={label}><HiOutlinePhotograph size={12} className="inline mr-1" />Images (multiple allowed)</label>
                  <input type="file" accept="image/*" multiple className="text-sm text-slate-500 w-full" onChange={e => setItemForm((f: any) => ({ ...f, imageFiles: e.target.files }))} />
                </div>
                <div>
                  <label className={label}><HiOutlineMusicNote size={12} className="inline mr-1" />Audio Narration</label>
                  <input type="file" accept="audio/*" className="text-sm text-slate-500 w-full" onChange={e => setItemForm((f: any) => ({ ...f, audioFile: e.target.files?.[0] }))} />
                </div>
                <div>
                  <label className={label}><HiOutlineFilm size={12} className="inline mr-1" />Video URL</label>
                  <input className={inp} placeholder="Paste video URL" value={itemForm.videoUrl ?? ''} onChange={e => setItemForm((f: any) => ({ ...f, videoUrl: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={submitItem} disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 transition">
                  {loading ? 'Saving…' : editingItem !== null ? 'Update' : 'Create'}
                </button>
                {editingItem !== null && <button onClick={() => { setEditingItem(null); setItemForm({}); }} className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-500 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Features ({items.length})</p>
                {Math.ceil(items.length / PAGE) > 1 && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <button onClick={() => setItemPage(p => Math.max(1, p - 1))} disabled={itemPage === 1} className="p-1 disabled:opacity-30 hover:text-blue-500"><HiChevronLeft size={15} /></button>
                    {itemPage} / {Math.ceil(items.length / PAGE)}
                    <button onClick={() => setItemPage(p => Math.min(Math.ceil(items.length / PAGE), p + 1))} disabled={itemPage === Math.ceil(items.length / PAGE)} className="p-1 disabled:opacity-30 hover:text-blue-500"><HiChevronRight size={15} /></button>
                  </div>
                )}
              </div>
              {items.slice((itemPage - 1) * PAGE, itemPage * PAGE).map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-3">
                  {item.media[0]
                    ? <img src={item.media[0].url} alt={item.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                    : <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0"><MdOutlinePlace size={24} className="text-blue-300" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.location.name} · {item.category.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                    <div className="flex gap-2 mt-1.5">
                      {item.audioUrl && <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full"><HiOutlineMusicNote size={10} /> Audio</span>}
                      {item.videoUrl && <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full"><HiOutlineFilm size={10} /> Video</span>}
                      {item.media.length > 0 && <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full"><HiOutlinePhotograph size={10} /> {item.media.length}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => { setEditingItem(item.id); setItemForm({ name: item.name, description: item.description, locationId: String(item.location.id), categoryId: String(item.category.id), habitat: item.habitat ?? '', conservation: item.conservation ?? '', facts: item.facts ?? '', duration: item.duration ?? '', videoUrl: item.videoUrl ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1 text-xs text-blue-500 hover:underline"><HiOutlinePencil size={12} /> Edit</button>
                    <button onClick={async () => { if (!confirm('Delete this feature?')) return; await adminDeleteItem(item.id, token); fetchItems({ limit: 200 }).then(r => setItems(r.data)); flash('Deleted.'); }} className="flex items-center gap-1 text-xs text-red-400 hover:underline"><HiOutlineTrash size={12} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── NFC OBJECTS ── */}
        {tab === 'objects' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-3">
                {editingObj !== null
                  ? <><HiOutlinePencil size={15} className="text-blue-500" /> Edit NFC Object</>
                  : <><HiOutlinePlus size={15} className="text-blue-500" /> Add NFC Object</>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className={inp} placeholder="Name *" value={objForm.name ?? ''} onChange={e => setObjForm((f: any) => ({ ...f, name: e.target.value }))} />
                <select className={inp} value={objForm.type ?? ''} onChange={e => setObjForm((f: any) => ({ ...f, type: e.target.value }))}>
                  <option value="">Type *</option>
                  <option value="animal">Animal</option>
                  <option value="bird">Bird</option>
                  <option value="tree">Tree</option>
                  <option value="landmark">Landmark</option>
                </select>
              </div>
              <textarea className={inp} rows={2} placeholder="Description *" value={objForm.description ?? ''} onChange={e => setObjForm((f: any) => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inp} placeholder="Latitude *" type="number" value={objForm.latitude ?? ''} onChange={e => setObjForm((f: any) => ({ ...f, latitude: e.target.value }))} />
                <input className={inp} placeholder="Longitude *" type="number" value={objForm.longitude ?? ''} onChange={e => setObjForm((f: any) => ({ ...f, longitude: e.target.value }))} />
                <input className={inp} placeholder="NFC ID (unique)" value={objForm.nfcId ?? ''} onChange={e => setObjForm((f: any) => ({ ...f, nfcId: e.target.value }))} />
                <input className={inp} placeholder="QR Code (unique)" value={objForm.qrCode ?? ''} onChange={e => setObjForm((f: any) => ({ ...f, qrCode: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}><HiOutlinePhotograph size={12} className="inline mr-1" />Image</label>
                  <input type="file" accept="image/*" className="text-sm text-slate-500 w-full" onChange={e => setObjForm((f: any) => ({ ...f, imageFile: e.target.files?.[0] }))} />
                </div>
                <div>
                  <label className={label}><HiOutlineMusicNote size={12} className="inline mr-1" />Audio</label>
                  <input type="file" accept="audio/*" className="text-sm text-slate-500 w-full" onChange={e => setObjForm((f: any) => ({ ...f, audioFile: e.target.files?.[0] }))} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={submitObj} disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 transition">
                  {loading ? 'Saving…' : editingObj !== null ? 'Update' : 'Create'}
                </button>
                {editingObj !== null && <button onClick={() => { setEditingObj(null); setObjForm({}); }} className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-500 hover:bg-slate-50 transition">Cancel</button>}
              </div>
            </div>

            {/* Objects list */}
            <div className="space-y-3 pb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">NFC Objects ({objects.length})</p>
                {Math.ceil(objects.length / PAGE) > 1 && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <button onClick={() => setObjPage(p => Math.max(1, p - 1))} disabled={objPage === 1} className="p-1 disabled:opacity-30 hover:text-blue-500"><HiChevronLeft size={15} /></button>
                    {objPage} / {Math.ceil(objects.length / PAGE)}
                    <button onClick={() => setObjPage(p => Math.min(Math.ceil(objects.length / PAGE), p + 1))} disabled={objPage === Math.ceil(objects.length / PAGE)} className="p-1 disabled:opacity-30 hover:text-blue-500"><HiChevronRight size={15} /></button>
                  </div>
                )}
              </div>
              {objects.slice((objPage - 1) * PAGE, objPage * PAGE).map(obj => (
                <div key={obj.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-3">
                  {obj.imageUrl
                    ? <img src={obj.imageUrl} alt={obj.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                    : <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {TYPE_ICON[obj.type] ?? <MdOutlinePlace size={22} className="text-blue-300" />}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{obj.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{obj.type}</p>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {obj.nfcId  && <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full"><MdNfc size={10} /> {obj.nfcId}</span>}
                      {obj.qrCode && <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full"><MdQrCode size={10} /> {obj.qrCode}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => { setEditingObj(obj.id); setObjForm({ name: obj.name, type: obj.type, description: obj.description, latitude: String(obj.latitude), longitude: String(obj.longitude), nfcId: obj.nfcId ?? '', qrCode: obj.qrCode ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1 text-xs text-blue-500 hover:underline"><HiOutlinePencil size={12} /> Edit</button>
                    <button onClick={async () => { if (!confirm('Delete this object?')) return; await deleteObject(obj.id, token); fetchObjects(1, 200).then(r => setObjects(r.data)); flash('Deleted.'); }} className="flex items-center gap-1 text-xs text-red-400 hover:underline"><HiOutlineTrash size={12} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
