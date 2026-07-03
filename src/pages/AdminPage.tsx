import { useState, useEffect } from 'react';
import {
  HiOutlineLockClosed, HiOutlineUser, HiEye, HiEyeOff,
  HiOutlineLogout, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus,
  HiChevronLeft, HiChevronRight,
  HiOutlineLocationMarker, HiCheckCircle, HiXCircle, HiOutlineTag,
  HiOutlineFilm, HiOutlineMusicNote, HiOutlinePhotograph,
} from 'react-icons/hi';
import { MdNfc, MdQrCode, MdPets, MdPark, MdAccountBalance, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage } from 'react-icons/gi';
import { TbLeaf, TbMapPin } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';

import { adminLogin, fetchObjects, createObject, updateObject, deleteObject, type TourObject } from '../services/objectService';
import {
  fetchLocations, fetchCategories, fetchItems,
  adminCreateLocation, adminUpdateLocation, adminDeleteLocation,
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminCreateItem, adminUpdateItem, adminDeleteItem,
  directUploadToCloudinary,
  type Location, type Category, type Item,
} from '../services/tourismService';

type Tab = 'locations' | 'categories' | 'items' | 'objects';

const TAB_CONFIG: { key: Tab; label: string; icon: JSX.Element }[] = [
  { key: 'locations',  label: 'Destinations', icon: <TbMapPin size={18} />        },
  { key: 'categories', label: 'Categories',   icon: <HiOutlineTag size={18} />         },
  { key: 'items',      label: 'Features',     icon: <MdOutlinePlace size={18} />   },
  { key: 'objects',    label: 'NFC Objects',  icon: <MdNfc size={18} />            },
];

const inp = 'w-full border border-gray-200 rounded-2xl px-5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white text-slate-800 transition-all';
const label = 'text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1';

function CatSlide({ images, name }: { images: { id: number; url: string }[]; name: string }) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setSlide(s => (s + 1) % images.length), 2500);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-sm">
      {images.map((img, i) => (
        <img
          key={img.id} src={img.url} alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === slide ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [token,    setToken]    = useState(() => sessionStorage.getItem('admin_token') ?? '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [tab,      setTab]      = useState<Tab>('locations');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [objects,    setObjects]    = useState<TourObject[]>([]);
  const [locations,  setLocations]  = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items,      setItems]      = useState<Item[]>([]);

  const [locForm,  setLocForm]  = useState<any>({});
  const [catForm,  setCatForm]  = useState<any>({ pendingImages: [] as File[] });
  const [itemForm, setItemForm] = useState<any>({});
  const [objForm,  setObjForm]  = useState<any>({});
  const [editingLoc,  setEditingLoc]  = useState<number | null>(null);
  const [editingCat,  setEditingCat]  = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingObj,  setEditingObj]  = useState<number | null>(null);

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
    setSigningIn(true);
    try {
      const { token: t } = await adminLogin(username, password);
      sessionStorage.setItem('admin_token', t);
      setToken(t);
    } catch (e: any) {
      setLoginErr('Invalid credentials or server error.');
    }
    setSigningIn(false);
  };

  const handleLogout = () => { sessionStorage.removeItem('admin_token'); setToken(''); };

  const submitLoc = async () => {
    setLoading(true); setUploadProgress(0);
    try {
      const fd = new FormData();
      const { name, description, latitude, longitude, featured, imageFile, videoFile, videoUrl } = locForm;
      if (name)        fd.append('name', name);
      if (description) fd.append('description', description);
      if (latitude)    fd.append('latitude', String(latitude));
      if (longitude)   fd.append('longitude', String(longitude));
      if (featured != null) fd.append('featured', String(featured));
      if (imageFile)   fd.append('image', imageFile);
      if (videoFile) {
        const url = await directUploadToCloudinary(videoFile, token, 'smart-tourism/videos', setUploadProgress);
        fd.append('videoUrl', url);
      } else if (videoUrl !== undefined) fd.append('videoUrl', videoUrl);
      editingLoc !== null
        ? await adminUpdateLocation(editingLoc, fd, token)
        : await adminCreateLocation(fd, token);
      flash('Success');
      setLocForm({}); setEditingLoc(null);
      await fetchLocations().then(setLocations);
    } catch (e: any) {
      const msg = e?.response?.data?.error
        ?? e?.response?.data?.message
        ?? (typeof e?.response?.data === 'string' ? e.response.data : null)
        ?? e?.message
        ?? 'Error saving.';
      flash(msg);
      console.error('submitLoc error:', e?.response ?? e);
    }
    setLoading(false);
  };

  const submitCat = async () => {
    setLoading(true); setUploadProgress(0);
    try {
      const fd = new FormData();
      const { name, slug, description, pendingImages } = catForm;
      if (name)        fd.append('name', name);
      if (slug)        fd.append('slug', slug);
      if (description !== undefined) fd.append('description', description);
      (pendingImages as File[] ?? []).forEach(f => fd.append('images', f));
      editingCat !== null
        ? await adminUpdateCategory(editingCat, fd, token, setUploadProgress)
        : await adminCreateCategory(fd, token, setUploadProgress);
      flash('Success');
      setCatForm({ pendingImages: [] }); setEditingCat(null);
      await fetchCategories().then(setCategories);
    } catch (e: any) { flash(e?.response?.data?.error ?? 'Error saving.'); }
    setLoading(false);
  };

  const submitItem = async () => {
    setLoading(true); setUploadProgress(0);
    try {
      const fd = new FormData();
      const { name, description, locationId, categoryId, habitat, conservation, facts, duration,
              audioFile, videoFile, videoUrl, imageFiles } = itemForm;
      if (name)         fd.append('name', name);
      if (description)  fd.append('description', description);
      if (locationId)   fd.append('locationId', String(locationId));
      if (categoryId)   fd.append('categoryId', String(categoryId));
      if (habitat)      fd.append('habitat', habitat);
      if (conservation) fd.append('conservation', conservation);
      if (facts)        fd.append('facts', facts);
      if (duration)     fd.append('duration', duration);
      if (audioFile)    fd.append('audio', audioFile);
      if (videoFile) {
        const url = await directUploadToCloudinary(videoFile, token, 'smart-tourism/videos', setUploadProgress);
        fd.append('videoUrl', url);
      } else if (videoUrl !== undefined) fd.append('videoUrl', videoUrl);
      if (imageFiles)   Array.from(imageFiles as FileList).forEach(f => fd.append('images', f as File));
      editingItem !== null
        ? await adminUpdateItem(editingItem, fd, token)
        : await adminCreateItem(fd, token);
      flash('Success');
      setItemForm({}); setEditingItem(null);
      await fetchItems({ limit: 200 }).then(r => setItems(r.data));
    } catch (e: any) { flash(e?.response?.data?.error ?? 'Error saving.'); }
    setLoading(false);
  };

  const submitObj = async () => {
    setLoading(true); setUploadProgress(0);
    try {
      const fd = new FormData();
      const { name, type, description, nfcId, qrCode, latitude, longitude, imageFile } = objForm;
      if (name)      fd.append('name', name);
      if (type)      fd.append('type', type);
      if (description) fd.append('description', description);
      if (nfcId)     fd.append('nfcId', nfcId);
      if (qrCode)    fd.append('qrCode', qrCode);
      if (latitude)  fd.append('latitude', String(latitude));
      if (longitude) fd.append('longitude', String(longitude));
      if (imageFile) fd.append('image', imageFile);
      editingObj !== null ? await updateObject(editingObj, fd, token) : await createObject(fd, token);
      flash('Success');
      setObjForm({}); setEditingObj(null);
      await fetchObjects(1, 200).then(r => setObjects(r.data));
    } catch (e: any) { flash(e?.response?.data?.error ?? 'Error saving.'); }
    setLoading(false);
  };

  if (!token) return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-modern p-10 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary rounded-[28px] flex items-center justify-center mx-auto mb-6">
            <HiOutlineLockClosed size={36} className="text-slate-900" />
          </div>
          <h1 className="text-3xl font-headings font-extrabold text-slate-900">Admin Portal</h1>
          <p className="text-gray-400 font-medium">Manage your smart tourism platform</p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <HiOutlineUser size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
            <input
              className="w-full border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-gray-50/50"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="relative group">
            <HiOutlineLockClosed size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
            <input
              type={showPw ? 'text' : 'password'}
              className="w-full border border-gray-100 rounded-2xl pl-12 pr-12 py-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-gray-50/50"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors"
            >
              {showPw ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </div>

          {loginErr && (
            <div className="bg-accent/10 text-accent text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
              <HiXCircle size={16} /> {loginErr}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={signingIn}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-headings font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {signingIn ? 'Authenticating...' : 'Sign In'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Tab Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {TAB_CONFIG.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap rounded-2xl transition-all ${
                  tab === t.key
                    ? 'bg-primary text-slate-900 shadow-md'
                    : 'text-gray-400 hover:text-slate-600 hover:bg-gray-50'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold text-accent hover:bg-accent/5 px-4 py-2 rounded-xl transition-colors"
          >
            <HiOutlineLogout size={18} /> Logout
          </button>
        </div>
        {/* Upload progress bar */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-1 bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto w-full p-6 lg:p-10 space-y-10 flex-1">
        {/* Flash message */}
        <AnimatePresence>
          {msg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-primary p-4 rounded-2xl text-slate-900 font-bold text-sm flex items-center gap-3 shadow-lg"
            >
              <HiCheckCircle size={20} /> {msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONTENT AREA ── */}
        <div className="grid grid-cols-1 gap-12">
          
          {/* Form Section */}
          <section className="bg-white rounded-[40px] shadow-modern p-10 space-y-8 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary-dark">
                {editingLoc !== null || editingCat !== null || editingItem !== null || editingObj !== null 
                  ? <HiOutlinePencil size={24} /> 
                  : <HiOutlinePlus size={24} />
                }
              </div>
              <h2 className="text-2xl font-headings font-extrabold text-slate-900">
                {editingLoc !== null || editingCat !== null || editingItem !== null || editingObj !== null 
                  ? 'Update' 
                  : 'Add New'
                } {tab.charAt(0).toUpperCase() + tab.slice(1, -1)}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Forms would go here - I'll keep the existing logic but style the inputs */}
               {tab === 'locations' && (
                 <>
                   <div className="md:col-span-2">
                     <label className={label}>Name</label>
                     <input className={inp} placeholder="e.g. Volcanoes National Park" value={locForm.name ?? ''} onChange={e => setLocForm({...locForm, name: e.target.value})} />
                   </div>
                   <div className="md:col-span-2">
                     <label className={label}>Description</label>
                     <textarea className={inp} rows={4} placeholder="Tell us about this place..." value={locForm.description ?? ''} onChange={e => setLocForm({...locForm, description: e.target.value})} />
                   </div>
                   <div>
                     <label className={label}>Latitude</label>
                     <input type="number" className={inp} value={locForm.latitude ?? ''} onChange={e => setLocForm({...locForm, latitude: e.target.value})} />
                   </div>
                   <div>
                     <label className={label}>Longitude</label>
                     <input type="number" className={inp} value={locForm.longitude ?? ''} onChange={e => setLocForm({...locForm, longitude: e.target.value})} />
                   </div>
                   <div className="md:col-span-2">
                     <label className={label}>Cover Image</label>
                     <input type="file" accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-gray-50 file:text-slate-900 hover:file:bg-primary transition-all" onChange={e => setLocForm({...locForm, imageFile: e.target.files?.[0]})} />
                   </div>
                   <div className="md:col-span-2">
                     <label className={label}>Video</label>
                     <div className="flex gap-3 mb-3">
                       <button type="button" onClick={() => setLocForm({...locForm, _videoMode: 'url', videoFile: undefined})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${locForm._videoMode !== 'file' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'}`}>URL</button>
                       <button type="button" onClick={() => setLocForm({...locForm, _videoMode: 'file', videoUrl: ''})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${locForm._videoMode === 'file' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'}`}>Upload</button>
                     </div>
                     {locForm._videoMode === 'file'
                       ? <input type="file" accept="video/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-gray-50 file:text-slate-900 hover:file:bg-primary transition-all" onChange={e => setLocForm({...locForm, videoFile: e.target.files?.[0]})} />
                       : <input className={inp} placeholder="https://youtube.com/..." value={locForm.videoUrl ?? ''} onChange={e => setLocForm({...locForm, videoUrl: e.target.value})} />
                     }
                   </div>
                 </>
               )}
               {tab === 'categories' && (
                  <>
                    <div className="md:col-span-2">
                      <label className={label}>Category Name</label>
                      <input className={inp} placeholder="e.g. Wildlife" value={catForm.name ?? ''} onChange={e => setCatForm({...catForm, name: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Slug</label>
                      <input className={inp} placeholder="wildlife" value={catForm.slug ?? ''} onChange={e => setCatForm({...catForm, slug: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Description</label>
                      <textarea className={inp} rows={3} placeholder="Short description..." value={catForm.description ?? ''} onChange={e => setCatForm({...catForm, description: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Add Images</label>
                      <input type="file" multiple className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-gray-50 file:text-slate-900 hover:file:bg-primary transition-all" onChange={e => setCatForm({...catForm, pendingImages: [...(catForm.pendingImages || []), ...Array.from(e.target.files || [])]})} />
                    </div>
                  </>
               )}
               {tab === 'items' && (
                 <>
                    <div className="md:col-span-2">
                      <label className={label}>Feature Name</label>
                      <input className={inp} placeholder="e.g. Mountain Gorilla" value={itemForm.name ?? ''} onChange={e => setItemForm({...itemForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className={label}>Destination</label>
                      <select className={inp} value={itemForm.locationId ?? (itemForm.location?.id ?? '')} onChange={e => setItemForm({...itemForm, locationId: e.target.value})}>
                        <option value="">Select Destination</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={label}>Category</label>
                      <select className={inp} value={itemForm.categoryId ?? (itemForm.category?.id ?? '')} onChange={e => setItemForm({...itemForm, categoryId: e.target.value})}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Description</label>
                      <textarea className={inp} rows={3} placeholder="Detailed description..." value={itemForm.description ?? ''} onChange={e => setItemForm({...itemForm, description: e.target.value})} />
                    </div>
                    <div>
                      <label className={label}>Habitat</label>
                      <input className={inp} placeholder="e.g. Rainforest" value={itemForm.habitat ?? ''} onChange={e => setItemForm({...itemForm, habitat: e.target.value})} />
                    </div>
                    <div>
                      <label className={label}>Conservation Status</label>
                      <input className={inp} placeholder="e.g. Endangered" value={itemForm.conservation ?? ''} onChange={e => setItemForm({...itemForm, conservation: e.target.value})} />
                    </div>
                    <div>
                      <label className={label}>Duration</label>
                      <input className={inp} placeholder="e.g. 2–3 hours" value={itemForm.duration ?? ''} onChange={e => setItemForm({...itemForm, duration: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Facts (one per line)</label>
                      <textarea className={inp} rows={3} placeholder="Fact 1&#10;Fact 2" value={itemForm.facts ?? ''} onChange={e => setItemForm({...itemForm, facts: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Audio Narration</label>
                      <input type="file" accept="audio/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-gray-50 file:text-slate-900 hover:file:bg-primary transition-all" onChange={e => setItemForm({...itemForm, audioFile: e.target.files?.[0]})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Video</label>
                      <div className="flex gap-3 mb-3">
                        <button type="button" onClick={() => setItemForm({...itemForm, _videoMode: 'url', videoFile: undefined})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${itemForm._videoMode !== 'file' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'}`}>URL</button>
                        <button type="button" onClick={() => setItemForm({...itemForm, _videoMode: 'file', videoUrl: ''})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${itemForm._videoMode === 'file' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500'}`}>Upload</button>
                      </div>
                      {itemForm._videoMode === 'file'
                        ? <input type="file" accept="video/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-gray-50 file:text-slate-900 hover:file:bg-primary transition-all" onChange={e => setItemForm({...itemForm, videoFile: e.target.files?.[0]})} />
                        : <input className={inp} placeholder="https://youtube.com/..." value={itemForm.videoUrl ?? ''} onChange={e => setItemForm({...itemForm, videoUrl: e.target.value})} />
                      }
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Add Images</label>
                      <input type="file" multiple accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-gray-50 file:text-slate-900 hover:file:bg-primary transition-all" onChange={e => setItemForm({...itemForm, imageFiles: e.target.files})} />
                    </div>
                 </>
               )}
               {tab === 'objects' && (
                 <>
                    <div className="md:col-span-2">
                      <label className={label}>Object Name</label>
                      <input className={inp} placeholder="e.g. Ancient Ficus Tree" value={objForm.name ?? ''} onChange={e => setObjForm({...objForm, name: e.target.value})} />
                    </div>
                    <div>
                      <label className={label}>Type</label>
                      <select className={inp} value={objForm.type ?? ''} onChange={e => setObjForm({...objForm, type: e.target.value})}>
                        <option value="">Select Type</option>
                        <option value="animal">Animal</option>
                        <option value="bird">Bird</option>
                        <option value="tree">Tree</option>
                        <option value="landmark">Landmark</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>NFC ID</label>
                      <input className={inp} placeholder="ID from chip" value={objForm.nfcId ?? ''} onChange={e => setObjForm({...objForm, nfcId: e.target.value})} />
                    </div>
                    <div>
                      <label className={label}>QR Code</label>
                      <input className={inp} placeholder="QR code value" value={objForm.qrCode ?? ''} onChange={e => setObjForm({...objForm, qrCode: e.target.value})} />
                    </div>
                    <div>
                      <label className={label}>Latitude</label>
                      <input type="number" className={inp} value={objForm.latitude ?? ''} onChange={e => setObjForm({...objForm, latitude: e.target.value})} />
                    </div>
                    <div>
                      <label className={label}>Longitude</label>
                      <input type="number" className={inp} value={objForm.longitude ?? ''} onChange={e => setObjForm({...objForm, longitude: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Description</label>
                      <textarea className={inp} rows={3} placeholder="NFC tag description..." value={objForm.description ?? ''} onChange={e => setObjForm({...objForm, description: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={label}>Image</label>
                      <input type="file" accept="image/*" className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-bold file:bg-gray-50 file:text-slate-900 hover:file:bg-primary transition-all" onChange={e => setObjForm({...objForm, imageFile: e.target.files?.[0]})} />
                    </div>
                 </>
               )}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={tab === 'locations' ? submitLoc : tab === 'categories' ? submitCat : tab === 'items' ? submitItem : submitObj} 
                className="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-headings font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Save Changes'}
              </button>
              {(editingLoc || editingCat || editingItem || editingObj) && (
                <button 
                  onClick={() => { setEditingLoc(null); setEditingCat(null); setEditingItem(null); setEditingObj(null); setLocForm({}); setCatForm({pendingImages: []}); setItemForm({}); setObjForm({}); }}
                  className="px-8 py-4 border border-gray-100 rounded-2xl font-headings font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </section>

          {/* List Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-xl font-headings font-extrabold text-slate-900 uppercase tracking-tighter italic">Existing Records</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tab === 'locations' ? locations.length : tab === 'categories' ? categories.length : items.length} Total</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {tab === 'locations' && locations.map(loc => (
                <div key={loc.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-modern transition-all">
                  <div className="w-24 h-24 rounded-[28px] overflow-hidden flex-shrink-0">
                    <img src={loc.coverImage ? `${loc.coverImage}?t=${loc.id}` : 'https://picsum.photos/400/400?destination'} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-headings font-bold text-lg text-slate-900">{loc.name}</h4>
                    <p className="text-gray-400 text-sm line-clamp-1">{loc.description}</p>
                    <div className="flex gap-4 pt-1">
                       <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-dark bg-primary/10 px-3 py-1 rounded-full">
                         <TbMapPin size={12} /> {loc._count?.items ?? 0} Features
                       </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingLoc(loc.id); setLocForm(loc); window.scrollTo({ top: 104, behavior: 'smooth' }); }} className="p-3 bg-gray-50 hover:bg-primary text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><HiOutlinePencil size={20} /></button>
                    <button onClick={async () => { if(confirm('Delete?')) await adminDeleteLocation(loc.id, token); fetchLocations().then(setLocations); }} className="p-3 bg-gray-50 hover:bg-accent text-slate-400 hover:text-white rounded-2xl transition-all"><HiOutlineTrash size={20} /></button>
                  </div>
                </div>
              ))}

              {tab === 'categories' && categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-modern transition-all">
                  {cat.images?.length > 0 ? (
                    <CatSlide images={cat.images} name={cat.name} />
                  ) : (
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                      <HiOutlinePhotograph size={32} />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-headings font-bold text-lg text-slate-900">{cat.name}</h4>
                    <p className="text-gray-400 text-sm line-clamp-1">{cat.description}</p>
                    <div className="flex gap-4 pt-1">
                       <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-dark bg-primary/10 px-3 py-1 rounded-full">
                         {cat._count?.items ?? 0} Items
                       </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCat(cat.id); setCatForm({...cat, pendingImages: []}); window.scrollTo({ top: 104, behavior: 'smooth' }); }} className="p-3 bg-gray-50 hover:bg-primary text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><HiOutlinePencil size={20} /></button>
                    <button onClick={async () => { if(confirm('Delete?')) await adminDeleteCategory(cat.id, token); fetchCategories().then(setCategories); }} className="p-3 bg-gray-50 hover:bg-accent text-slate-400 hover:text-white rounded-2xl transition-all"><HiOutlineTrash size={20} /></button>
                  </div>
                </div>
              ))}

              {tab === 'items' && items.map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-modern transition-all">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.media[0]?.url ? `${item.media[0].url}?t=${item.media[0].id}` : 'https://picsum.photos/200/200?item'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-headings font-bold text-lg text-slate-900">{item.name}</h4>
                    <p className="text-gray-400 text-sm line-clamp-1">{item.location.name} · {item.category.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(item.id); setItemForm({ name: item.name, description: item.description, locationId: String(item.location.id), categoryId: String(item.category.id), habitat: item.habitat ?? '', conservation: item.conservation ?? '', facts: item.facts ?? '', duration: item.duration ?? '', videoUrl: item.videoUrl ?? '' }); window.scrollTo({ top: 104, behavior: 'smooth' }); }} className="p-3 bg-gray-50 hover:bg-primary text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><HiOutlinePencil size={20} /></button>
                    <button onClick={async () => { if(confirm('Delete?')) await adminDeleteItem(item.id, token); fetchItems({limit: 200}).then(r => setItems(r.data)); }} className="p-3 bg-gray-50 hover:bg-accent text-slate-400 hover:text-white rounded-2xl transition-all"><HiOutlineTrash size={20} /></button>
                  </div>
                </div>
              ))}

              {tab === 'objects' && objects.map(obj => (
                <div key={obj.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-modern transition-all">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-primary-dark">
                    <MdNfc size={32} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-headings font-bold text-lg text-slate-900">{obj.name}</h4>
                    <p className="text-gray-400 text-sm">{obj.nfcId || 'No NFC ID'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingObj(obj.id); setObjForm(obj); window.scrollTo({ top: 104, behavior: 'smooth' }); }} className="p-3 bg-gray-50 hover:bg-primary text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><HiOutlinePencil size={20} /></button>
                    <button onClick={async () => { if(confirm('Delete?')) await deleteObject(obj.id, token); fetchObjects(1, 200).then(r => setObjects(r.data)); }} className="p-3 bg-gray-50 hover:bg-accent text-slate-400 hover:text-white rounded-2xl transition-all"><HiOutlineTrash size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
