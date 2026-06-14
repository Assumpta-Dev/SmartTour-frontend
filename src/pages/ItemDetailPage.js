import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { HiArrowLeft, HiHeart, HiOutlineHeart, HiChevronRight, HiVolumeUp, HiVolumeOff, HiPlay, } from 'react-icons/hi';
import { MdPets, MdPark, MdAccountBalance, MdRestaurant, MdHotel, MdDirectionsWalk, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage, GiCampingTent } from 'react-icons/gi';
import { TbLeaf, TbClock } from 'react-icons/tb';
import { useRef } from 'react';
import { fetchItem } from '../services/tourismService';
import { Footer } from './HomePage';
const CAT_ICON = {
    animals: _jsx(MdPets, { size: 20 }),
    birds: _jsx(GiBirdCage, { size: 20 }),
    forests: _jsx(MdPark, { size: 20 }),
    plants: _jsx(TbLeaf, { size: 20 }),
    camping: _jsx(GiCampingTent, { size: 20 }),
    hotels: _jsx(MdHotel, { size: 20 }),
    restaurants: _jsx(MdRestaurant, { size: 20 }),
    activities: _jsx(MdDirectionsWalk, { size: 20 }),
    attractions: _jsx(MdAccountBalance, { size: 20 }),
};
function AudioBtn({ src }) {
    const ref = useRef(null);
    const [playing, setPlaying] = useState(false);
    const toggle = () => {
        if (!ref.current)
            return;
        playing ? ref.current.pause() : ref.current.play();
        setPlaying(p => !p);
    };
    return (_jsxs("button", { onClick: toggle, className: `flex items-center gap-3 w-full px-5 py-4 rounded-2xl border transition active:scale-95 ${playing ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-blue-200 text-blue-500 hover:bg-blue-50'}`, children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${playing ? 'bg-white/20' : 'bg-blue-50'}`, children: playing ? _jsx(HiVolumeUp, { size: 20 }) : _jsx(HiVolumeOff, { size: 20 }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-sm font-semibold", children: playing ? 'Pause Narration' : 'Listen to Narration' }), _jsx("p", { className: `text-xs mt-0.5 ${playing ? 'text-blue-100' : 'text-slate-400'}`, children: playing ? 'Playing audio guide…' : 'Tap to hear the audio guide' })] }), _jsx("audio", { ref: ref, src: src, onEnded: () => setPlaying(false) })] }));
}
export default function ItemDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [tab, setTab] = useState('overview');
    const [error, setError] = useState(false);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        if (!slug)
            return;
        fetchItem(slug).then(setItem).catch(() => setError(true));
        const favs = JSON.parse(localStorage.getItem('favourites') ?? '[]');
        setSaved(favs.includes(slug));
    }, [slug]);
    const toggleFav = () => {
        const favs = JSON.parse(localStorage.getItem('favourites') ?? '[]');
        const next = saved ? favs.filter(f => f !== slug) : [...favs, slug];
        localStorage.setItem('favourites', JSON.stringify(next));
        setSaved(!saved);
    };
    if (error)
        return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-white gap-4", children: [_jsx(MdOutlinePlace, { size: 48, className: "text-blue-100" }), _jsx("p", { className: "text-slate-500", children: "Item not found." }), _jsx("button", { onClick: () => navigate(-1), className: "text-blue-500 text-sm underline", children: "Go back" })] }));
    if (!item)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-white", children: _jsx("div", { className: "w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" }) }));
    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'habitat', label: 'Habitat' },
        { key: 'conservation', label: 'Conservation' },
        { key: 'facts', label: 'Facts' },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-50 px-5 py-3.5 flex items-center justify-between shadow-sm", children: [_jsx("button", { onClick: () => navigate(-1), className: "w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 transition", children: _jsx(HiArrowLeft, { size: 18 }) }), _jsx("span", { className: "font-bold text-slate-800 text-sm truncate mx-3 flex-1", children: item.name }), _jsx("button", { onClick: toggleFav, className: "w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition", children: saved
                                    ? _jsx(HiHeart, { size: 18, className: "text-blue-500" })
                                    : _jsx(HiOutlineHeart, { size: 18, className: "text-slate-400" }) })] }), item.media.length > 0 ? (_jsx(Swiper, { modules: [Navigation, Pagination], navigation: true, pagination: { clickable: true }, speed: 600, slidesPerView: 1, className: "w-full", style: { height: '280px' }, children: item.media.map(m => (_jsx(SwiperSlide, { children: m.type === 'video'
                                ? _jsx("video", { src: m.url, controls: true, className: "w-full h-full object-cover" })
                                : _jsx("img", { src: m.url, alt: m.caption ?? item.name, className: "w-full h-full object-cover" }) }, m.id))) })) : (_jsx("div", { className: "w-full h-64 bg-blue-50 flex items-center justify-center text-blue-200", children: CAT_ICON[item.category.slug] ?? _jsx(MdOutlinePlace, { size: 48 }) })), _jsxs("div", { className: "px-5 py-6 space-y-6", children: [_jsxs("div", { className: "bg-blue-50 rounded-3xl px-5 py-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-blue-500 mb-2", children: [CAT_ICON[item.category.slug] ?? _jsx(MdOutlinePlace, { size: 18 }), _jsxs("span", { className: "text-xs font-semibold uppercase tracking-wider", children: [item.category.name, " \u00B7 ", item.location.name] })] }), _jsx("h1", { className: "text-2xl font-bold text-slate-800 leading-tight", children: item.name }), item.duration && (_jsxs("p", { className: "flex items-center gap-1.5 text-xs text-slate-500 mt-2", children: [_jsx(TbClock, { size: 13 }), " ", item.duration] })), item.rating > 0 && (_jsxs("p", { className: "flex items-center gap-1 text-xs text-amber-500 mt-1.5 font-semibold", children: ['⭐'.repeat(Math.round(item.rating)), " ", item.rating.toFixed(1), " / 5"] }))] }), item.audioUrl && _jsx(AudioBtn, { src: item.audioUrl }), item.videoUrl && (_jsxs("div", { children: [_jsxs("p", { className: "flex items-center gap-2 text-sm font-bold text-slate-800 mb-3", children: [_jsx(HiPlay, { size: 16, className: "text-blue-500" }), " Video Overview"] }), _jsx("video", { src: item.videoUrl, controls: true, className: "w-full rounded-3xl border border-slate-100 shadow-sm" })] })), _jsxs("div", { children: [_jsx("div", { className: "flex bg-blue-50 rounded-2xl p-1 gap-1 mb-5", children: tabs.map(t => (_jsx("button", { onClick: () => setTab(t.key), className: `flex-1 py-2 text-xs font-semibold rounded-xl transition ${tab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`, children: t.label }, t.key))) }), _jsxs(motion.div, { initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.2 }, className: "text-slate-600 text-sm leading-relaxed bg-white rounded-3xl border border-slate-100 px-5 py-4 min-h-[80px]", children: [tab === 'overview' && _jsx("p", { children: item.description }), tab === 'habitat' && _jsx("p", { children: item.habitat ?? 'No habitat information available.' }), tab === 'conservation' && _jsx("p", { children: item.conservation ?? 'No conservation information available.' }), tab === 'facts' && _jsx("p", { style: { whiteSpace: 'pre-line' }, children: item.facts ?? 'No facts available.' })] }, tab)] }), item.related && item.related.length > 0 && (_jsxs("div", { className: "pb-8", children: [_jsx("p", { className: "text-base font-bold text-slate-800 mb-4", children: "You May Also Like" }), _jsx("div", { className: "flex gap-3 overflow-x-auto pb-2", children: item.related.map(r => (_jsxs(motion.button, { whileHover: { y: -3 }, onClick: () => navigate(`/items/${r.slug}`), className: "flex-shrink-0 w-36 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm text-left", children: [r.media[0]
                                                    ? _jsx("img", { src: r.media[0].url, alt: r.name, className: "w-full h-24 object-cover" })
                                                    : _jsx("div", { className: "w-full h-24 bg-blue-50 flex items-center justify-center text-blue-200", children: CAT_ICON[r.category.slug] ?? _jsx(MdOutlinePlace, { size: 24 }) }), _jsxs("div", { className: "p-3", children: [_jsx("p", { className: "text-xs font-semibold text-slate-800 line-clamp-2", children: r.name }), _jsxs("p", { className: "flex items-center gap-0.5 text-xs text-blue-500 mt-1", children: ["View ", _jsx(HiChevronRight, { size: 11 })] })] })] }, r.id))) })] }))] })] }), _jsx(Footer, {})] }));
}
