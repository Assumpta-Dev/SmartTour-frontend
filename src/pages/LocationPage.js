import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiChevronRight } from 'react-icons/hi';
import { MdPets, MdPark, MdAccountBalance, MdRestaurant, MdHotel, MdDirectionsWalk, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage, GiCampingTent } from 'react-icons/gi';
import { TbLeaf } from 'react-icons/tb';
import { fetchLocation, fetchCategories, fetchItems } from '../services/tourismService';
import { Footer } from './HomePage';
const CAT_ICON = {
    animals: _jsx(MdPets, { size: 18 }),
    birds: _jsx(GiBirdCage, { size: 18 }),
    forests: _jsx(MdPark, { size: 18 }),
    plants: _jsx(TbLeaf, { size: 18 }),
    camping: _jsx(GiCampingTent, { size: 18 }),
    hotels: _jsx(MdHotel, { size: 18 }),
    restaurants: _jsx(MdRestaurant, { size: 18 }),
    activities: _jsx(MdDirectionsWalk, { size: 18 }),
    attractions: _jsx(MdAccountBalance, { size: 18 }),
};
export default function LocationPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [location, setLocation] = useState(null);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [activeCat, setActiveCat] = useState(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        if (!slug)
            return;
        fetchLocation(slug).then(setLocation).catch(() => setError(true));
        fetchCategories().then(setCategories).catch(() => null);
    }, [slug]);
    useEffect(() => {
        if (!location)
            return;
        fetchItems({ locationId: location.id, categoryId: activeCat ?? undefined, limit: 50 })
            .then(r => setItems(r.data)).catch(() => null);
    }, [location, activeCat]);
    if (error)
        return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-white gap-4", children: [_jsx(MdOutlinePlace, { size: 48, className: "text-blue-100" }), _jsx("p", { className: "text-slate-500", children: "Location not found." }), _jsx("button", { onClick: () => navigate('/'), className: "text-blue-500 text-sm underline", children: "Back to home" })] }));
    if (!location)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-white", children: _jsx("div", { className: "w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" }) }));
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("div", { className: "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-50 px-5 py-3.5 flex items-center gap-3 shadow-sm", children: [_jsx("button", { onClick: () => navigate('/'), className: "w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 transition flex-shrink-0", children: _jsx(HiArrowLeft, { size: 18 }) }), _jsx("span", { className: "font-bold text-slate-800 truncate", children: location.name })] }), _jsx("div", { className: "pt-[60px]", children: location.coverImage
                    ? _jsxs("div", { className: "relative h-64 overflow-hidden", children: [_jsx("img", { src: location.coverImage, alt: location.name, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" }), _jsx("div", { className: "absolute bottom-5 left-6", children: _jsx("h1", { className: "text-white text-2xl font-bold", children: location.name }) })] })
                    : _jsx("div", { className: "h-48 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center", children: _jsx(MdPark, { size: 56, className: "text-blue-200" }) }) }), _jsxs("div", { className: "max-w-3xl mx-auto px-5 py-8 space-y-8", children: [_jsxs("div", { className: "bg-blue-50 rounded-3xl px-6 py-5", children: [_jsx("h2", { className: "text-lg font-bold text-slate-800 mb-2", children: location.name }), _jsx("p", { className: "text-slate-600 text-sm leading-relaxed", children: location.description })] }), location.videoUrl && (_jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-slate-800 mb-3", children: "Overview Video" }), _jsx("video", { src: location.videoUrl, controls: true, className: "w-full rounded-3xl shadow-sm border border-slate-100", poster: location.coverImage ?? undefined })] })), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold text-slate-800 mb-4", children: "Explore Features" }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx("button", { onClick: () => setActiveCat(null), className: `flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition ${activeCat === null ? 'bg-blue-500 text-white shadow-sm shadow-blue-200' : 'bg-blue-50 text-slate-600 hover:bg-blue-100'}`, children: "All" }), categories.map(cat => (_jsxs("button", { onClick: () => setActiveCat(cat.id === activeCat ? null : cat.id), className: `flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition ${activeCat === cat.id ? 'bg-blue-500 text-white shadow-sm shadow-blue-200' : 'bg-blue-50 text-slate-600 hover:bg-blue-100'}`, children: [_jsx("span", { className: activeCat === cat.id ? 'text-white' : 'text-blue-500', children: CAT_ICON[cat.slug] ?? _jsx(MdAccountBalance, { size: 18 }) }), cat.name] }, cat.id)))] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4 pb-10", children: [items.map(item => (_jsxs(motion.button, { whileHover: { y: -4 }, transition: { type: 'spring', stiffness: 300 }, onClick: () => navigate(`/items/${item.slug}`), className: "bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm text-left group", children: [item.media[0]
                                        ? _jsx("img", { src: item.media[0].url, alt: item.name, className: "w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500" })
                                        : _jsx("div", { className: "w-full h-28 bg-blue-50 flex items-center justify-center text-blue-300", children: CAT_ICON[item.category.slug] ?? _jsx(MdOutlinePlace, { size: 28 }) }), _jsxs("div", { className: "p-3", children: [_jsx("p", { className: "font-bold text-slate-800 text-sm line-clamp-1", children: item.name }), _jsx("p", { className: "text-xs text-slate-400 capitalize mt-0.5", children: item.category.name }), _jsxs("p", { className: "flex items-center gap-0.5 text-xs text-blue-500 mt-1.5 font-medium", children: ["View ", _jsx(HiChevronRight, { size: 12 })] })] })] }, item.id))), items.length === 0 && (_jsx("div", { className: "col-span-2 sm:col-span-3 text-center py-12 text-slate-400 text-sm", children: "No features added yet for this destination." }))] })] }), _jsx(Footer, {})] }));
}
