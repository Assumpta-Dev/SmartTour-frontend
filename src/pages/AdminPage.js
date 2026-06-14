import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { HiOutlineLockClosed, HiOutlineUser, HiEye, HiEyeOff, HiOutlineLogout, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiChevronLeft, HiChevronRight, HiOutlinePhotograph, HiOutlineMusicNote, HiOutlineFilm, HiOutlineLocationMarker, HiCheckCircle, HiXCircle, } from 'react-icons/hi';
import { MdNfc, MdQrCode, MdPets, MdPark, MdAccountBalance, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage } from 'react-icons/gi';
import { TbLeaf, TbMapPin } from 'react-icons/tb';
import { adminLogin, fetchObjects, createObject, updateObject, deleteObject } from '../services/objectService';
import { fetchLocations, fetchCategories, fetchItems, adminCreateLocation, adminUpdateLocation, adminDeleteLocation, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminCreateItem, adminUpdateItem, adminDeleteItem, } from '../services/tourismService';
import { Footer } from './HomePage';
const TAB_CONFIG = [
    { key: 'locations', label: 'Destinations', icon: _jsx(TbMapPin, { size: 16 }) },
    { key: 'categories', label: 'Categories', icon: _jsx(MdPark, { size: 16 }) },
    { key: 'items', label: 'Features', icon: _jsx(MdOutlinePlace, { size: 16 }) },
    { key: 'objects', label: 'NFC Objects', icon: _jsx(MdNfc, { size: 16 }) },
];
const TYPE_ICON = {
    animal: _jsx(MdPets, { size: 18, className: "text-blue-500" }),
    bird: _jsx(GiBirdCage, { size: 18, className: "text-blue-500" }),
    tree: _jsx(TbLeaf, { size: 18, className: "text-blue-500" }),
    landmark: _jsx(MdAccountBalance, { size: 18, className: "text-blue-500" }),
};
const inp = 'w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white text-slate-800 placeholder:text-slate-400';
const label = 'text-xs font-semibold text-slate-500 mb-1 block';
export default function AdminPage() {
    const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') ?? '');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loginErr, setLoginErr] = useState('');
    const [tab, setTab] = useState('locations');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [objects, setObjects] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [locForm, setLocForm] = useState({});
    const [catForm, setCatForm] = useState({});
    const [itemForm, setItemForm] = useState({});
    const [objForm, setObjForm] = useState({});
    const [editingLoc, setEditingLoc] = useState(null);
    const [editingCat, setEditingCat] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editingObj, setEditingObj] = useState(null);
    // pagination
    const [locPage, setLocPage] = useState(1);
    const [itemPage, setItemPage] = useState(1);
    const [objPage, setObjPage] = useState(1);
    const PAGE = 6;
    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };
    useEffect(() => {
        if (!token)
            return;
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
        }
        catch (e) {
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
            Object.entries(locForm).forEach(([k, v]) => { if (k !== 'imageFile' && v != null)
                fd.append(k, String(v)); });
            if (locForm.imageFile)
                fd.append('image', locForm.imageFile);
            editingLoc !== null ? await adminUpdateLocation(editingLoc, fd, token) : await adminCreateLocation(fd, token);
            flash(editingLoc !== null ? 'Destination updated.' : 'Destination created.');
            setLocForm({});
            setEditingLoc(null);
            fetchLocations().then(setLocations);
        }
        catch (e) {
            flash(e.response?.data?.error ?? 'Error saving.');
        }
        setLoading(false);
    };
    const submitCat = async () => {
        setLoading(true);
        try {
            const fd = new FormData();
            if (catForm.name)
                fd.append('name', catForm.name);
            if (catForm.slug)
                fd.append('slug', catForm.slug);
            if (catForm.description)
                fd.append('description', catForm.description);
            if (catForm.imageFiles)
                Array.from(catForm.imageFiles).forEach((f) => fd.append('images', f));
            editingCat !== null ? await adminUpdateCategory(editingCat, fd, token) : await adminCreateCategory(fd, token);
            flash(editingCat !== null ? 'Category updated.' : 'Category created.');
            setCatForm({});
            setEditingCat(null);
            fetchCategories().then(setCategories);
        }
        catch (e) {
            flash(e.response?.data?.error ?? 'Error saving.');
        }
        setLoading(false);
    };
    const submitItem = async () => {
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(itemForm).forEach(([k, v]) => {
                if (k !== 'imageFiles' && k !== 'audioFile' && v != null)
                    fd.append(k, String(v));
            });
            if (itemForm.audioFile)
                fd.append('audio', itemForm.audioFile);
            if (itemForm.imageFiles)
                Array.from(itemForm.imageFiles).forEach((f) => fd.append('images', f));
            editingItem !== null ? await adminUpdateItem(editingItem, fd, token) : await adminCreateItem(fd, token);
            flash(editingItem !== null ? 'Feature updated.' : 'Feature created.');
            setItemForm({});
            setEditingItem(null);
            fetchItems({ limit: 200 }).then(r => setItems(r.data));
            fetchLocations().then(setLocations);
        }
        catch (e) {
            flash(e.response?.data?.error ?? 'Error saving.');
        }
        setLoading(false);
    };
    const submitObj = async () => {
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(objForm).forEach(([k, v]) => { if (k !== 'imageFile' && k !== 'audioFile' && v != null)
                fd.append(k, String(v)); });
            if (objForm.imageFile)
                fd.append('image', objForm.imageFile);
            if (objForm.audioFile)
                fd.append('audio', objForm.audioFile);
            editingObj !== null ? await updateObject(editingObj, fd, token) : await createObject(fd, token);
            flash(editingObj !== null ? 'Object updated.' : 'Object created.');
            setObjForm({});
            setEditingObj(null);
            fetchObjects(1, 200).then(r => setObjects(r.data));
        }
        catch (e) {
            flash(e.response?.data?.error ?? 'Error saving.');
        }
        setLoading(false);
    };
    // ── Login ──────────────────────────────────────────────────────────────────
    if (!token)
        return (_jsxs("div", { className: "min-h-screen bg-white flex flex-col", children: [_jsx("div", { className: "flex-1 flex items-center justify-center px-6 py-12", children: _jsxs("div", { className: "w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-lg p-8", children: [_jsxs("div", { className: "flex flex-col items-center mb-8", children: [_jsx("div", { className: "w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4", children: _jsx(HiOutlineLockClosed, { size: 28, className: "text-blue-500" }) }), _jsx("h1", { className: "text-2xl font-bold text-slate-800", children: "Admin Login" }), _jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Smart Tourism Management" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(HiOutlineUser, { size: 16, className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { className: "w-full border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-400 text-slate-800 placeholder:text-slate-400", placeholder: "Username", value: username, onChange: e => setUsername(e.target.value), onKeyDown: e => e.key === 'Enter' && handleLogin() })] }), _jsxs("div", { className: "relative", children: [_jsx(HiOutlineLockClosed, { size: 16, className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: showPw ? 'text' : 'password', className: "w-full border border-slate-200 rounded-2xl pl-10 pr-11 py-3 text-sm outline-none focus:border-blue-400 text-slate-800 placeholder:text-slate-400", placeholder: "Password", value: password, onChange: e => setPassword(e.target.value), onKeyDown: e => e.key === 'Enter' && handleLogin() }), _jsx("button", { type: "button", onClick: () => setShowPw(v => !v), className: "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition", children: showPw ? _jsx(HiEyeOff, { size: 17 }) : _jsx(HiEye, { size: 17 }) })] }), loginErr && (_jsxs("p", { className: "flex items-center gap-2 text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl", children: [_jsx(HiXCircle, { size: 14 }), " ", loginErr] })), _jsx("button", { onClick: handleLogin, className: "w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold transition shadow-sm shadow-blue-200", children: "Sign In" })] })] }) }), _jsx(Footer, {})] }));
    const isErr = msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed');
    // ── Dashboard ──────────────────────────────────────────────────────────────
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 flex flex-col", children: [_jsxs("header", { className: "bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center", children: _jsx(TbMapPin, { size: 16, className: "text-white" }) }), _jsx("span", { className: "font-bold text-slate-800", children: "Admin Dashboard" })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition px-3 py-2 rounded-xl hover:bg-red-50", children: [_jsx(HiOutlineLogout, { size: 16 }), " Logout"] })] }), _jsx("div", { className: "bg-white border-b border-slate-100 px-4 flex gap-1 overflow-x-auto", children: TAB_CONFIG.map(t => (_jsxs("button", { onClick: () => setTab(t.key), className: `flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition ${tab === t.key
                        ? 'border-blue-500 text-blue-500'
                        : 'border-transparent text-slate-500 hover:text-slate-700'}`, children: [t.icon, " ", t.label] }, t.key))) }), msg && (_jsxs("div", { className: `mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium ${isErr ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`, children: [isErr ? _jsx(HiXCircle, { size: 16 }) : _jsx(HiCheckCircle, { size: 16 }), msg] })), _jsxs("div", { className: "max-w-3xl mx-auto w-full p-4 space-y-5 flex-1", children: [tab === 'locations' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4", children: [_jsx("div", { className: "flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-3", children: editingLoc !== null
                                            ? _jsxs(_Fragment, { children: [_jsx(HiOutlinePencil, { size: 15, className: "text-blue-500" }), " Edit Destination"] })
                                            : _jsxs(_Fragment, { children: [_jsx(HiOutlinePlus, { size: 15, className: "text-blue-500" }), " Add Destination"] }) }), _jsx("input", { className: inp, placeholder: "Name *", value: locForm.name ?? '', onChange: e => setLocForm((f) => ({ ...f, name: e.target.value })) }), _jsx("textarea", { className: inp, rows: 3, placeholder: "Description *", value: locForm.description ?? '', onChange: e => setLocForm((f) => ({ ...f, description: e.target.value })) }), _jsx("input", { className: inp, placeholder: "Video URL", value: locForm.videoUrl ?? '', onChange: e => setLocForm((f) => ({ ...f, videoUrl: e.target.value })) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { className: inp, placeholder: "Latitude", type: "number", value: locForm.latitude ?? '', onChange: e => setLocForm((f) => ({ ...f, latitude: e.target.value })) }), _jsx("input", { className: inp, placeholder: "Longitude", type: "number", value: locForm.longitude ?? '', onChange: e => setLocForm((f) => ({ ...f, longitude: e.target.value })) })] }), _jsxs("div", { children: [_jsxs("label", { className: label, children: [_jsx(HiOutlinePhotograph, { size: 12, className: "inline mr-1" }), "Cover Image"] }), _jsx("input", { type: "file", accept: "image/*", className: "text-sm text-slate-500 w-full", onChange: e => setLocForm((f) => ({ ...f, imageFile: e.target.files?.[0] })) })] }), _jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none", children: [_jsx("input", { type: "checkbox", className: "accent-blue-500", checked: locForm.featured === 'true' || locForm.featured === true, onChange: e => setLocForm((f) => ({ ...f, featured: e.target.checked ? 'true' : 'false' })) }), "Featured on homepage"] }), _jsxs("div", { className: "flex gap-2 pt-1", children: [_jsx("button", { onClick: submitLoc, disabled: loading, className: "flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 transition", children: loading ? 'Saving…' : editingLoc !== null ? 'Update' : 'Create' }), editingLoc !== null && _jsx("button", { onClick: () => { setEditingLoc(null); setLocForm({}); }, className: "px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-500 hover:bg-slate-50 transition", children: "Cancel" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("p", { className: "text-sm font-bold text-slate-700", children: ["Destinations (", locations.length, ")"] }), Math.ceil(locations.length / PAGE) > 1 && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-slate-400", children: [_jsx("button", { onClick: () => setLocPage(p => Math.max(1, p - 1)), disabled: locPage === 1, className: "p-1 disabled:opacity-30 hover:text-blue-500", children: _jsx(HiChevronLeft, { size: 15 }) }), locPage, " / ", Math.ceil(locations.length / PAGE), _jsx("button", { onClick: () => setLocPage(p => Math.min(Math.ceil(locations.length / PAGE), p + 1)), disabled: locPage === Math.ceil(locations.length / PAGE), className: "p-1 disabled:opacity-30 hover:text-blue-500", children: _jsx(HiChevronRight, { size: 15 }) })] }))] }), locations.slice((locPage - 1) * PAGE, locPage * PAGE).map(loc => (_jsxs("div", { className: "bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-3", children: [loc.coverImage
                                                ? _jsx("img", { src: loc.coverImage, alt: loc.name, className: "w-16 h-16 rounded-2xl object-cover flex-shrink-0" })
                                                : _jsx("div", { className: "w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0", children: _jsx(MdPark, { size: 24, className: "text-blue-300" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-slate-800 text-sm", children: loc.name }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5 line-clamp-2", children: loc.description }), _jsxs("p", { className: "text-xs text-blue-400 mt-1 flex items-center gap-1", children: [_jsx(HiOutlineLocationMarker, { size: 11 }), " ", loc._count?.items ?? 0, " features"] })] }), _jsxs("div", { className: "flex flex-col gap-2 flex-shrink-0", children: [_jsxs("button", { onClick: () => { setEditingLoc(loc.id); setLocForm({ name: loc.name, description: loc.description, videoUrl: loc.videoUrl ?? '', latitude: loc.latitude, longitude: loc.longitude, featured: String(loc.featured) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }, className: "flex items-center gap-1 text-xs text-blue-500 hover:underline", children: [_jsx(HiOutlinePencil, { size: 12 }), " Edit"] }), _jsxs("button", { onClick: async () => { if (!confirm('Delete this destination?'))
                                                            return; await adminDeleteLocation(loc.id, token); fetchLocations().then(setLocations); flash('Deleted.'); }, className: "flex items-center gap-1 text-xs text-red-400 hover:underline", children: [_jsx(HiOutlineTrash, { size: 12 }), " Delete"] })] })] }, loc.id)))] })] })), tab === 'categories' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4", children: [_jsx("div", { className: "flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-3", children: editingCat !== null
                                            ? _jsxs(_Fragment, { children: [_jsx(HiOutlinePencil, { size: 15, className: "text-blue-500" }), " Edit Category"] })
                                            : _jsxs(_Fragment, { children: [_jsx(HiOutlinePlus, { size: 15, className: "text-blue-500" }), " Add Category"] }) }), _jsx("input", { className: inp, placeholder: "Name * (e.g. Birds)", value: catForm.name ?? '', onChange: e => setCatForm((f) => ({ ...f, name: e.target.value })) }), _jsx("input", { className: inp, placeholder: "Slug * (e.g. birds \u2014 lowercase, no spaces)", value: catForm.slug ?? '', onChange: e => setCatForm((f) => ({ ...f, slug: e.target.value })) }), _jsx("textarea", { className: inp, rows: 3, placeholder: "Short description of this category", value: catForm.description ?? '', onChange: e => setCatForm((f) => ({ ...f, description: e.target.value })) }), _jsxs("div", { children: [_jsxs("label", { className: label, children: [_jsx(HiOutlinePhotograph, { size: 12, className: "inline mr-1" }), "Category Images (multiple allowed)"] }), _jsx("input", { type: "file", accept: "image/*", multiple: true, className: "text-sm text-slate-500 w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-500 hover:file:bg-blue-100", onChange: e => setCatForm((f) => ({ ...f, imageFiles: e.target.files })) }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "These images will appear in a slideshow when tourists browse this category." })] }), _jsxs("div", { className: "flex gap-2 pt-1", children: [_jsx("button", { onClick: submitCat, disabled: loading, className: "flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 transition", children: loading ? 'Saving…' : editingCat !== null ? 'Update' : 'Create' }), editingCat !== null && _jsx("button", { onClick: () => { setEditingCat(null); setCatForm({}); }, className: "px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-500 hover:bg-slate-50 transition", children: "Cancel" })] })] }), _jsx("div", { className: "space-y-3", children: categories.map(cat => (_jsx("div", { className: "bg-white rounded-3xl p-4 shadow-sm border border-slate-100", children: _jsxs("div", { className: "flex gap-3", children: [cat.images?.length > 0
                                                ? _jsxs("div", { className: "flex gap-1.5 flex-shrink-0", children: [cat.images.slice(0, 3).map((img, i) => (_jsx("img", { src: img.url, alt: cat.name, className: "w-14 h-14 rounded-2xl object-cover" }, i))), cat.images.length > 3 && (_jsxs("div", { className: "w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-400", children: ["+", cat.images.length - 3] }))] })
                                                : _jsx("div", { className: "w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0", children: _jsx(HiOutlinePhotograph, { size: 22, className: "text-blue-300" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-slate-800 text-sm", children: cat.name }), cat.description && _jsx("p", { className: "text-xs text-slate-500 mt-0.5 line-clamp-2", children: cat.description }), _jsxs("p", { className: "text-xs text-blue-400 mt-1", children: [cat._count?.items ?? 0, " features"] })] }), _jsxs("div", { className: "flex flex-col gap-2 flex-shrink-0", children: [_jsxs("button", { onClick: () => { setEditingCat(cat.id); setCatForm({ name: cat.name, slug: cat.slug ?? '', description: cat.description ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }, className: "flex items-center gap-1 text-xs text-blue-500 hover:underline", children: [_jsx(HiOutlinePencil, { size: 12 }), " Edit"] }), _jsxs("button", { onClick: async () => { if (!confirm('Delete this category?'))
                                                            return; await adminDeleteCategory(cat.id, token); fetchCategories().then(setCategories); flash('Deleted.'); }, className: "flex items-center gap-1 text-xs text-red-400 hover:underline", children: [_jsx(HiOutlineTrash, { size: 12 }), " Delete"] })] })] }) }, cat.id))) })] })), tab === 'items' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4", children: [_jsx("div", { className: "flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-3", children: editingItem !== null
                                            ? _jsxs(_Fragment, { children: [_jsx(HiOutlinePencil, { size: 15, className: "text-blue-500" }), " Edit Feature"] })
                                            : _jsxs(_Fragment, { children: [_jsx(HiOutlinePlus, { size: 15, className: "text-blue-500" }), " Add Feature"] }) }), _jsx("input", { className: inp, placeholder: "Name *", value: itemForm.name ?? '', onChange: e => setItemForm((f) => ({ ...f, name: e.target.value })) }), _jsx("textarea", { className: inp, rows: 3, placeholder: "Description *", value: itemForm.description ?? '', onChange: e => setItemForm((f) => ({ ...f, description: e.target.value })) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("select", { className: inp, value: itemForm.locationId ?? '', onChange: e => setItemForm((f) => ({ ...f, locationId: e.target.value })), children: [_jsx("option", { value: "", children: "Destination *" }), locations.map(l => _jsx("option", { value: l.id, children: l.name }, l.id))] }), _jsxs("select", { className: inp, value: itemForm.categoryId ?? '', onChange: e => setItemForm((f) => ({ ...f, categoryId: e.target.value })), children: [_jsx("option", { value: "", children: "Category *" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsx("textarea", { className: inp, rows: 2, placeholder: "Habitat", value: itemForm.habitat ?? '', onChange: e => setItemForm((f) => ({ ...f, habitat: e.target.value })) }), _jsx("textarea", { className: inp, rows: 2, placeholder: "Conservation status", value: itemForm.conservation ?? '', onChange: e => setItemForm((f) => ({ ...f, conservation: e.target.value })) }), _jsx("textarea", { className: inp, rows: 2, placeholder: "Interesting facts (one per line)", value: itemForm.facts ?? '', onChange: e => setItemForm((f) => ({ ...f, facts: e.target.value })) }), _jsx("input", { className: inp, placeholder: "Duration (e.g. 2\u20133 hours)", value: itemForm.duration ?? '', onChange: e => setItemForm((f) => ({ ...f, duration: e.target.value })) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("label", { className: label, children: [_jsx(HiOutlinePhotograph, { size: 12, className: "inline mr-1" }), "Images (multiple allowed)"] }), _jsx("input", { type: "file", accept: "image/*", multiple: true, className: "text-sm text-slate-500 w-full", onChange: e => setItemForm((f) => ({ ...f, imageFiles: e.target.files })) })] }), _jsxs("div", { children: [_jsxs("label", { className: label, children: [_jsx(HiOutlineMusicNote, { size: 12, className: "inline mr-1" }), "Audio Narration"] }), _jsx("input", { type: "file", accept: "audio/*", className: "text-sm text-slate-500 w-full", onChange: e => setItemForm((f) => ({ ...f, audioFile: e.target.files?.[0] })) })] }), _jsxs("div", { children: [_jsxs("label", { className: label, children: [_jsx(HiOutlineFilm, { size: 12, className: "inline mr-1" }), "Video URL"] }), _jsx("input", { className: inp, placeholder: "Paste video URL", value: itemForm.videoUrl ?? '', onChange: e => setItemForm((f) => ({ ...f, videoUrl: e.target.value })) })] })] }), _jsxs("div", { className: "flex gap-2 pt-1", children: [_jsx("button", { onClick: submitItem, disabled: loading, className: "flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 transition", children: loading ? 'Saving…' : editingItem !== null ? 'Update' : 'Create' }), editingItem !== null && _jsx("button", { onClick: () => { setEditingItem(null); setItemForm({}); }, className: "px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-500 hover:bg-slate-50 transition", children: "Cancel" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("p", { className: "text-sm font-bold text-slate-700", children: ["Features (", items.length, ")"] }), Math.ceil(items.length / PAGE) > 1 && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-slate-400", children: [_jsx("button", { onClick: () => setItemPage(p => Math.max(1, p - 1)), disabled: itemPage === 1, className: "p-1 disabled:opacity-30 hover:text-blue-500", children: _jsx(HiChevronLeft, { size: 15 }) }), itemPage, " / ", Math.ceil(items.length / PAGE), _jsx("button", { onClick: () => setItemPage(p => Math.min(Math.ceil(items.length / PAGE), p + 1)), disabled: itemPage === Math.ceil(items.length / PAGE), className: "p-1 disabled:opacity-30 hover:text-blue-500", children: _jsx(HiChevronRight, { size: 15 }) })] }))] }), items.slice((itemPage - 1) * PAGE, itemPage * PAGE).map(item => (_jsxs("div", { className: "bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-3", children: [item.media[0]
                                                ? _jsx("img", { src: item.media[0].url, alt: item.name, className: "w-16 h-16 rounded-2xl object-cover flex-shrink-0" })
                                                : _jsx("div", { className: "w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0", children: _jsx(MdOutlinePlace, { size: 24, className: "text-blue-300" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-slate-800 text-sm truncate", children: item.name }), _jsxs("p", { className: "text-xs text-slate-500", children: [item.location.name, " \u00B7 ", item.category.name] }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5 line-clamp-1", children: item.description }), _jsxs("div", { className: "flex gap-2 mt-1.5", children: [item.audioUrl && _jsxs("span", { className: "flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full", children: [_jsx(HiOutlineMusicNote, { size: 10 }), " Audio"] }), item.videoUrl && _jsxs("span", { className: "flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full", children: [_jsx(HiOutlineFilm, { size: 10 }), " Video"] }), item.media.length > 0 && _jsxs("span", { className: "flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full", children: [_jsx(HiOutlinePhotograph, { size: 10 }), " ", item.media.length] })] })] }), _jsxs("div", { className: "flex flex-col gap-2 flex-shrink-0", children: [_jsxs("button", { onClick: () => { setEditingItem(item.id); setItemForm({ name: item.name, description: item.description, locationId: String(item.location.id), categoryId: String(item.category.id), habitat: item.habitat ?? '', conservation: item.conservation ?? '', facts: item.facts ?? '', duration: item.duration ?? '', videoUrl: item.videoUrl ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }, className: "flex items-center gap-1 text-xs text-blue-500 hover:underline", children: [_jsx(HiOutlinePencil, { size: 12 }), " Edit"] }), _jsxs("button", { onClick: async () => { if (!confirm('Delete this feature?'))
                                                            return; await adminDeleteItem(item.id, token); fetchItems({ limit: 200 }).then(r => setItems(r.data)); flash('Deleted.'); }, className: "flex items-center gap-1 text-xs text-red-400 hover:underline", children: [_jsx(HiOutlineTrash, { size: 12 }), " Delete"] })] })] }, item.id)))] })] })), tab === 'objects' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4", children: [_jsx("div", { className: "flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-3", children: editingObj !== null
                                            ? _jsxs(_Fragment, { children: [_jsx(HiOutlinePencil, { size: 15, className: "text-blue-500" }), " Edit NFC Object"] })
                                            : _jsxs(_Fragment, { children: [_jsx(HiOutlinePlus, { size: 15, className: "text-blue-500" }), " Add NFC Object"] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { className: inp, placeholder: "Name *", value: objForm.name ?? '', onChange: e => setObjForm((f) => ({ ...f, name: e.target.value })) }), _jsxs("select", { className: inp, value: objForm.type ?? '', onChange: e => setObjForm((f) => ({ ...f, type: e.target.value })), children: [_jsx("option", { value: "", children: "Type *" }), _jsx("option", { value: "animal", children: "Animal" }), _jsx("option", { value: "bird", children: "Bird" }), _jsx("option", { value: "tree", children: "Tree" }), _jsx("option", { value: "landmark", children: "Landmark" })] })] }), _jsx("textarea", { className: inp, rows: 2, placeholder: "Description *", value: objForm.description ?? '', onChange: e => setObjForm((f) => ({ ...f, description: e.target.value })) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { className: inp, placeholder: "Latitude *", type: "number", value: objForm.latitude ?? '', onChange: e => setObjForm((f) => ({ ...f, latitude: e.target.value })) }), _jsx("input", { className: inp, placeholder: "Longitude *", type: "number", value: objForm.longitude ?? '', onChange: e => setObjForm((f) => ({ ...f, longitude: e.target.value })) }), _jsx("input", { className: inp, placeholder: "NFC ID (unique)", value: objForm.nfcId ?? '', onChange: e => setObjForm((f) => ({ ...f, nfcId: e.target.value })) }), _jsx("input", { className: inp, placeholder: "QR Code (unique)", value: objForm.qrCode ?? '', onChange: e => setObjForm((f) => ({ ...f, qrCode: e.target.value })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: label, children: [_jsx(HiOutlinePhotograph, { size: 12, className: "inline mr-1" }), "Image"] }), _jsx("input", { type: "file", accept: "image/*", className: "text-sm text-slate-500 w-full", onChange: e => setObjForm((f) => ({ ...f, imageFile: e.target.files?.[0] })) })] }), _jsxs("div", { children: [_jsxs("label", { className: label, children: [_jsx(HiOutlineMusicNote, { size: 12, className: "inline mr-1" }), "Audio"] }), _jsx("input", { type: "file", accept: "audio/*", className: "text-sm text-slate-500 w-full", onChange: e => setObjForm((f) => ({ ...f, audioFile: e.target.files?.[0] })) })] })] }), _jsxs("div", { className: "flex gap-2 pt-1", children: [_jsx("button", { onClick: submitObj, disabled: loading, className: "flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-2xl text-sm font-semibold disabled:opacity-50 transition", children: loading ? 'Saving…' : editingObj !== null ? 'Update' : 'Create' }), editingObj !== null && _jsx("button", { onClick: () => { setEditingObj(null); setObjForm({}); }, className: "px-4 py-2.5 border border-slate-200 rounded-2xl text-sm text-slate-500 hover:bg-slate-50 transition", children: "Cancel" })] })] }), _jsxs("div", { className: "space-y-3 pb-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("p", { className: "text-sm font-bold text-slate-700", children: ["NFC Objects (", objects.length, ")"] }), Math.ceil(objects.length / PAGE) > 1 && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-slate-400", children: [_jsx("button", { onClick: () => setObjPage(p => Math.max(1, p - 1)), disabled: objPage === 1, className: "p-1 disabled:opacity-30 hover:text-blue-500", children: _jsx(HiChevronLeft, { size: 15 }) }), objPage, " / ", Math.ceil(objects.length / PAGE), _jsx("button", { onClick: () => setObjPage(p => Math.min(Math.ceil(objects.length / PAGE), p + 1)), disabled: objPage === Math.ceil(objects.length / PAGE), className: "p-1 disabled:opacity-30 hover:text-blue-500", children: _jsx(HiChevronRight, { size: 15 }) })] }))] }), objects.slice((objPage - 1) * PAGE, objPage * PAGE).map(obj => (_jsxs("div", { className: "bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-3", children: [obj.imageUrl
                                                ? _jsx("img", { src: obj.imageUrl, alt: obj.name, className: "w-16 h-16 rounded-2xl object-cover flex-shrink-0" })
                                                : _jsx("div", { className: "w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0", children: TYPE_ICON[obj.type] ?? _jsx(MdOutlinePlace, { size: 22, className: "text-blue-300" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-bold text-slate-800 text-sm truncate", children: obj.name }), _jsx("p", { className: "text-xs text-slate-500 capitalize", children: obj.type }), _jsxs("div", { className: "flex gap-2 mt-1.5 flex-wrap", children: [obj.nfcId && _jsxs("span", { className: "flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full", children: [_jsx(MdNfc, { size: 10 }), " ", obj.nfcId] }), obj.qrCode && _jsxs("span", { className: "flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full", children: [_jsx(MdQrCode, { size: 10 }), " ", obj.qrCode] })] })] }), _jsxs("div", { className: "flex flex-col gap-2 flex-shrink-0", children: [_jsxs("button", { onClick: () => { setEditingObj(obj.id); setObjForm({ name: obj.name, type: obj.type, description: obj.description, latitude: String(obj.latitude), longitude: String(obj.longitude), nfcId: obj.nfcId ?? '', qrCode: obj.qrCode ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }, className: "flex items-center gap-1 text-xs text-blue-500 hover:underline", children: [_jsx(HiOutlinePencil, { size: 12 }), " Edit"] }), _jsxs("button", { onClick: async () => { if (!confirm('Delete this object?'))
                                                            return; await deleteObject(obj.id, token); fetchObjects(1, 200).then(r => setObjects(r.data)); flash('Deleted.'); }, className: "flex items-center gap-1 text-xs text-red-400 hover:underline", children: [_jsx(HiOutlineTrash, { size: 12 }), " Delete"] })] })] }, obj.id)))] })] }))] }), _jsx(Footer, {})] }));
}
