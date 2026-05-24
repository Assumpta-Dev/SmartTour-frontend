import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { HiOutlineLockClosed, HiOutlineLogout, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiChevronLeft, HiChevronRight, HiDownload, HiX, HiPlay, HiPause, } from 'react-icons/hi';
import { MdNfc, MdQrCode } from 'react-icons/md';
import { adminLogin, fetchObjects, createObject, updateObject, deleteObject, } from '../services/objectService';
const PAGE_SIZE = 5;
const BASE_URL = window.location.origin;
const EMPTY = { name: '', type: '', description: '', nfcId: '', qrCode: '', audioUrl: '' };
const qrUrl = (o) => o.qrCode ? `${BASE_URL}/qr/${o.qrCode}` : `${BASE_URL}/object/${o.id}`;
const nfcUrl = (o) => o.nfcId ? `${BASE_URL}/nfc/${o.nfcId}` : null;
/* ── Mini audio player used inside preview modal ── */
function PreviewAudio({ src }) {
    const ref = useRef(null);
    const [playing, setPlaying] = useState(false);
    const toggle = () => {
        if (!ref.current)
            return;
        playing ? ref.current.pause() : ref.current.play();
        setPlaying(p => !p);
    };
    return (_jsxs("div", { className: "flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 w-full", children: [_jsx("button", { onClick: toggle, className: "w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 hover:bg-blue-400 transition", children: playing ? _jsx(HiPause, { size: 18 }) : _jsx(HiPlay, { size: 18, className: "ml-0.5" }) }), _jsx("span", { className: "text-sm text-slate-600", children: playing ? 'Playing…' : 'Play narration' }), _jsx("audio", { ref: ref, src: src, onEnded: () => setPlaying(false) })] }));
}
export default function AdminPage() {
    const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') ?? '');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginErr, setLoginErr] = useState('');
    const [objects, setObjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editing, setEditing] = useState(null);
    const [formKey, setFormKey] = useState(0);
    const [msg, setMsg] = useState('');
    const [page, setPage] = useState(1);
    const [preview, setPreview] = useState(null);
    const load = useCallback(() => fetchObjects(1, 500).then(r => setObjects(r.data)).catch(() => null), []);
    useEffect(() => { if (token)
        load(); }, [token, load]);
    const handleLogin = async () => {
        setLoginErr('');
        try {
            const { token: t } = await adminLogin(username, password);
            sessionStorage.setItem('admin_token', t);
            setToken(t);
        }
        catch (e) {
            const msg = e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? '';
            if (!e?.response) {
                setLoginErr('Cannot reach server. Make sure the backend is running.');
            }
            else {
                setLoginErr(msg || `Error ${e.response.status}`);
            }
        }
    };
    const handleLogout = () => { sessionStorage.removeItem('admin_token'); setToken(''); };
    const handleEdit = (obj) => {
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
        setLoading(true);
        setMsg('');
        try {
            const fd = new FormData();
            ['name', 'type', 'description', 'latitude', 'longitude', 'nfcId', 'qrCode', 'audioUrl']
                .forEach(f => { if (form[f] != null && form[f] !== '')
                fd.append(f, String(form[f])); });
            if (form.imageFile)
                fd.append('image', form.imageFile);
            if (form.audioFile)
                fd.append('audio', form.audioFile);
            editing !== null
                ? await updateObject(editing, fd, token)
                : await createObject(fd, token);
            setMsg(editing !== null ? 'Updated.' : 'Created.');
            handleCancel();
            load();
        }
        catch (e) {
            setMsg(e.response?.data?.error ?? 'Error saving.');
        }
        setLoading(false);
    };
    const handleDelete = async (id) => {
        if (!confirm('Delete this object?'))
            return;
        try {
            await deleteObject(id, token);
            setMsg('Deleted.');
            load();
        }
        catch {
            setMsg('Failed to delete.');
        }
    };
    const downloadQr = (obj) => {
        const c = document.querySelector(`#qrdl-${obj.id}`);
        if (!c)
            return;
        Object.assign(document.createElement('a'), { href: c.toDataURL('image/png'), download: `${obj.name}-qr.png` }).click();
    };
    const totalPages = Math.ceil(objects.length / PAGE_SIZE);
    const paged = objects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    /* ── Login ── */
    if (!token)
        return (_jsx("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center px-6", children: _jsxs("div", { className: "w-full max-w-sm bg-white rounded-3xl shadow-sm p-8", children: [_jsxs("div", { className: "flex flex-col items-center mb-8", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3", children: _jsx(HiOutlineLockClosed, { size: 26, className: "text-blue-500" }) }), _jsx("h1", { className: "text-xl font-bold text-slate-800", children: "Admin Login" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Smart Tourism Management" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("input", { className: "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400", placeholder: "Username", value: username, onChange: e => setUsername(e.target.value), onKeyDown: e => e.key === 'Enter' && handleLogin() }), _jsx("input", { type: "password", className: "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400", placeholder: "Password", value: password, onChange: e => setPassword(e.target.value), onKeyDown: e => e.key === 'Enter' && handleLogin() }), loginErr && _jsx("p", { className: "text-red-400 text-xs", children: loginErr }), _jsx("button", { onClick: handleLogin, className: "w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-400 transition", children: "Sign In" })] })] }) }));
    const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white';
    /* ── Dashboard ── */
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-slate-50", children: [_jsxs("header", { className: "bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between sticky top-0 z-10", children: [_jsx("h1", { className: "font-bold text-slate-800 text-sm", children: "Admin Dashboard" }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition", children: [_jsx(HiOutlineLogout, { size: 15 }), " Logout"] })] }), _jsxs("div", { className: "flex flex-col gap-3 p-4 max-w-2xl w-full mx-auto", children: [_jsxs("div", { className: "bg-white rounded-2xl shadow-sm flex-shrink-0 overflow-hidden", children: [_jsx("div", { className: "px-4 py-3 border-b border-slate-50 flex items-center gap-2 text-sm font-semibold text-slate-700", children: editing !== null
                                    ? _jsxs(_Fragment, { children: [_jsx(HiOutlinePencil, { size: 14, className: "text-blue-500" }), " Edit Object"] })
                                    : _jsxs(_Fragment, { children: [_jsx(HiOutlinePlus, { size: 14, className: "text-blue-500" }), " New Object"] }) }), _jsxs("div", { className: "p-4 space-y-2.5", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2.5", children: [_jsx("input", { className: inp, placeholder: "Name *", value: form.name ?? '', onChange: e => setForm(f => ({ ...f, name: e.target.value })) }, `n${formKey}`), _jsxs("select", { className: inp, value: form.type ?? '', onChange: e => setForm(f => ({ ...f, type: e.target.value })), children: [_jsx("option", { value: "", children: "Type *" }), _jsx("option", { value: "animal", children: "Animal" }), _jsx("option", { value: "bird", children: "Bird" }), _jsx("option", { value: "tree", children: "Tree" }), _jsx("option", { value: "landmark", children: "Landmark" })] }, `t${formKey}`), _jsx("textarea", { className: `${inp} col-span-2 resize-none`, placeholder: "Description *", rows: 4, value: form.description ?? '', onChange: e => setForm(f => ({ ...f, description: e.target.value })) }, `d${formKey}`), _jsx("input", { className: inp, placeholder: "Latitude *", type: "number", value: form.latitude ?? '', onChange: e => setForm(f => ({ ...f, latitude: parseFloat(e.target.value) })) }, `la${formKey}`), _jsx("input", { className: inp, placeholder: "Longitude *", type: "number", value: form.longitude ?? '', onChange: e => setForm(f => ({ ...f, longitude: parseFloat(e.target.value) })) }, `lo${formKey}`), _jsx("input", { className: inp, placeholder: "NFC ID", value: form.nfcId ?? '', onChange: e => setForm(f => ({ ...f, nfcId: e.target.value })) }, `nf${formKey}`), _jsx("input", { className: inp, placeholder: "QR Code", value: form.qrCode ?? '', onChange: e => setForm(f => ({ ...f, qrCode: e.target.value })) }, `qr${formKey}`)] }), _jsxs("div", { className: "grid grid-cols-2 gap-2.5", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs text-slate-400 mb-1 block", children: "Image" }), _jsx("input", { type: "file", accept: "image/*", className: "text-xs text-slate-500 w-full", onChange: e => setForm(f => ({ ...f, imageFile: e.target.files?.[0] })) }, `im${formKey}`)] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-slate-400 mb-1 block", children: "Audio" }), _jsx("input", { type: "file", accept: "audio/*", className: "text-xs text-slate-500 w-full", onChange: e => setForm(f => ({ ...f, audioFile: e.target.files?.[0] })) }, `au${formKey}`)] })] }), _jsx("input", { className: inp, placeholder: "Or paste audio URL", value: form.audioUrl ?? '', onChange: e => setForm(f => ({ ...f, audioUrl: e.target.value })) }, `au2${formKey}`), msg && _jsx("p", { className: `text-xs ${msg.includes('Error') || msg.includes('Failed') ? 'text-red-400' : 'text-green-500'}`, children: msg }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleSubmit, disabled: loading, className: "flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-400 disabled:opacity-50 transition", children: loading ? 'Saving…' : editing !== null ? 'Update' : 'Create' }), editing !== null && (_jsx("button", { onClick: handleCancel, className: "px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition", children: "Cancel" }))] })] })] }), _jsxs("div", { className: "flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden", children: [_jsxs("div", { className: "px-4 py-3 border-b border-slate-50 flex items-center justify-between flex-shrink-0", children: [_jsxs("span", { className: "text-sm font-semibold text-slate-700", children: ["Objects ", _jsxs("span", { className: "text-slate-400 font-normal", children: ["(", objects.length, ")"] })] }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-slate-400", children: [_jsx("button", { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: "p-1 disabled:opacity-30 hover:text-blue-500 transition rounded-lg hover:bg-slate-50", children: _jsx(HiChevronLeft, { size: 16 }) }), _jsxs("span", { className: "px-1", children: [page, " / ", Math.max(1, totalPages)] }), _jsx("button", { onClick: () => setPage(p => Math.min(Math.max(1, totalPages), p + 1)), disabled: page >= Math.max(1, totalPages), className: "p-1 disabled:opacity-30 hover:text-blue-500 transition rounded-lg hover:bg-slate-50", children: _jsx(HiChevronRight, { size: 16 }) })] })] }), _jsxs("div", { className: "divide-y divide-slate-50", children: [objects.length === 0 && (_jsx("p", { className: "text-center text-slate-400 text-sm py-12", children: "No objects yet." })), paged.map(obj => (_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition", children: [obj.imageUrl
                                                ? _jsx("img", { src: obj.imageUrl, alt: obj.name, className: "w-12 h-12 rounded-xl object-cover flex-shrink-0" })
                                                : _jsx("div", { className: "w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-slate-800 truncate", children: obj.name }), _jsx("p", { className: "text-xs text-slate-400 capitalize", children: obj.type })] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsx("button", { onClick: () => setPreview(obj), className: "text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition font-medium", children: "Preview" }), _jsx("button", { onClick: () => handleEdit(obj), className: "p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition", children: _jsx(HiOutlinePencil, { size: 15 }) }), _jsx("button", { onClick: () => handleDelete(obj.id), className: "p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400 transition", children: _jsx(HiOutlineTrash, { size: 15 }) })] }), _jsx("div", { className: "hidden", children: _jsx(QRCodeCanvas, { id: `qrdl-${obj.id}`, value: qrUrl(obj), size: 512, level: "H", includeMargin: true }) })] }, obj.id)))] })] })] }), preview && (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4", onClick: () => setPreview(null), children: _jsxs("div", { className: "bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "relative", children: [preview.imageUrl
                                    ? _jsx("img", { src: preview.imageUrl, alt: preview.name, className: "w-full h-48 object-cover rounded-t-3xl" })
                                    : _jsx("div", { className: "w-full h-32 bg-slate-100 rounded-t-3xl" }), _jsx("button", { onClick: () => setPreview(null), className: "absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition", children: _jsx(HiX, { size: 16 }) })] }), _jsxs("div", { className: "p-5 space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-slate-800", children: preview.name }), _jsx("p", { className: "text-xs text-slate-400 capitalize mt-0.5", children: preview.type })] }), _jsx("p", { className: "text-sm text-slate-600 leading-relaxed", children: preview.description }), preview.audioUrl
                                    ? _jsx(PreviewAudio, { src: preview.audioUrl })
                                    : (_jsxs("div", { className: "flex items-center gap-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl px-4 py-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0", children: _jsx(HiPlay, { size: 16, className: "text-slate-300 ml-0.5" }) }), _jsx("span", { className: "text-sm text-slate-400", children: "No audio \u2014 add one by editing this object" })] })), nfcUrl(preview) && (_jsxs("div", { className: "rounded-2xl bg-blue-50 border border-blue-100 p-4 space-y-2", children: [_jsxs("p", { className: "flex items-center gap-1.5 text-xs font-semibold text-blue-600", children: [_jsx(MdNfc, { size: 15 }), " NFC Tag URL"] }), _jsx("p", { className: "text-xs text-slate-500", children: "Copy this URL and write it to a physical NFC card:" }), _jsx("code", { className: "block text-xs bg-white border border-blue-100 rounded-xl px-3 py-2 text-blue-600 break-all select-all", children: nfcUrl(preview) })] })), _jsxs("div", { className: "rounded-2xl bg-slate-50 border border-slate-100 p-4 flex flex-col items-center gap-3", children: [_jsxs("p", { className: "flex items-center gap-1.5 text-xs font-semibold text-slate-600 self-start", children: [_jsx(MdQrCode, { size: 15 }), " QR Code"] }), _jsx("div", { className: "bg-white p-2 rounded-xl border border-slate-100 shadow-sm", children: _jsx(QRCodeCanvas, { value: qrUrl(preview), size: 160, level: "H", includeMargin: true }) }), _jsx("code", { className: "text-xs text-slate-400 break-all text-center", children: qrUrl(preview) }), _jsxs("button", { onClick: () => downloadQr(preview), className: "flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold rounded-xl transition w-full justify-center", children: [_jsx(HiDownload, { size: 15 }), " Download QR"] })] }), _jsxs("button", { onClick: () => handleEdit(preview), className: "flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition", children: [_jsx(HiOutlinePencil, { size: 14 }), " Edit this object"] })] })] }) }))] }));
}
