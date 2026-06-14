import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { HiOutlineCog, HiChevronRight, HiPhone, HiMail, HiLocationMarker, HiStar, } from 'react-icons/hi';
import { MdPets, MdPark, MdAccountBalance, MdRestaurant, MdHotel, MdDirectionsWalk, MdNfc, MdQrCodeScanner, MdGpsFixed, MdPhotoCamera, } from 'react-icons/md';
import { GiBirdCage, GiCampingTent } from 'react-icons/gi';
import { TbLeaf, TbWaterpolo } from 'react-icons/tb';
import { RiLeafLine } from 'react-icons/ri';
import { fetchLocations, fetchCategories, fetchItems, } from '../services/tourismService';
/* ── helpers ── */
const CAT_ICON = {
    animals: _jsx(MdPets, { size: 16 }),
    birds: _jsx(GiBirdCage, { size: 16 }),
    trees: _jsx(MdPark, { size: 16 }),
    plants: _jsx(TbLeaf, { size: 16 }),
    camping: _jsx(GiCampingTent, { size: 16 }),
    hotels: _jsx(MdHotel, { size: 16 }),
    restaurants: _jsx(MdRestaurant, { size: 16 }),
    activities: _jsx(MdDirectionsWalk, { size: 16 }),
    attractions: _jsx(MdAccountBalance, { size: 16 }),
    waterfalls: _jsx(TbWaterpolo, { size: 16 }),
};
/* ── Footer ── */
function Footer() {
    const navigate = useNavigate();
    return (_jsxs("footer", { className: "bg-blue-600 text-white", children: [_jsxs("div", { className: "max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-bold tracking-tight mb-3", children: "Smart Tourism" }), _jsx("p", { className: "text-blue-100 text-sm leading-relaxed", children: "Discover the land of a thousand hills \u2014 wildlife, culture, adventure and nature." }), _jsxs("div", { className: "flex gap-2 mt-4", children: [_jsxs("span", { className: "flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full", children: [_jsx(MdNfc, { size: 13 }), " NFC Tap"] }), _jsxs("span", { className: "flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full", children: [_jsx(MdQrCodeScanner, { size: 13 }), " QR Scan"] })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-blue-300 mb-3", children: "Explore" }), _jsx("ul", { className: "space-y-2 text-sm text-blue-100", children: [
                                    { label: 'Home', path: '/' },
                                    { label: 'GPS Explorer', path: '/gps' },
                                    { label: 'Volcanoes Park', path: '/locations/volcanoes' },
                                    { label: 'Akagera Park', path: '/locations/akagera' },
                                    { label: 'Nyungwe Forest', path: '/locations/nyungwe' },
                                ].map(l => (_jsx("li", { children: _jsx("button", { onClick: () => navigate(l.path), className: "hover:text-white transition", children: l.label }) }, l.path))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-blue-300 mb-3", children: "Contact" }), _jsxs("ul", { className: "space-y-2.5 text-sm text-blue-100", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(HiLocationMarker, { size: 14, className: "flex-shrink-0" }), " Kigali, Rwanda"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(HiPhone, { size: 14, className: "flex-shrink-0" }), " +250 700 000 000"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(HiMail, { size: 14, className: "flex-shrink-0" }), " info@tourism.rw"] })] })] })] }), _jsxs("div", { className: "border-t border-blue-500 px-8 py-4 text-center text-xs text-blue-300", children: ["\u00A9 ", new Date().getFullYear(), " Smart Tourism Guide \u00B7 Powered by ", _jsx("span", { className: "text-white font-semibold", children: "Icumu Tech Ltd" })] })] }));
}
export { Footer };
/* ══════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredItems, setFeaturedItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        Promise.all([
            fetchLocations().catch(() => []),
            fetchCategories().catch(() => []),
            fetchItems({ limit: 200 }).catch(() => ({ data: [] })),
        ]).then(([locs, cats, itemsRes]) => {
            const items = itemsRes.data ?? [];
            setLocations(locs);
            setCategories(cats);
            setAllItems(items);
            setFeaturedItems(items.filter((i) => i.media.length > 0 || i.featured));
            setReady(true);
        });
    }, []);
    // Compute item counts per location from actual fetched items
    const locationItemCount = (locId) => allItems.filter(i => i.location.id === locId).length;
    // Build slides from items WITH media + location covers — always enough to loop
    const itemSlides = featuredItems
        .filter(i => i.media[0]?.url)
        .map(i => ({
        image: i.media[0].url,
        title: i.name,
        sub: `${i.location.name} · ${i.category.name}`,
        slug: i.slug,
        catSlug: i.category.slug,
    }));
    const locSlides = locations
        .filter(l => l.coverImage)
        .map(l => ({
        image: l.coverImage,
        title: l.name,
        sub: 'Explore this destination',
        slug: l.slug,
        catSlug: '',
    }));
    // Merge: items first, then fill with location covers not already represented
    const usedSlugs = new Set(itemSlides.map(s => s.slug));
    const slides = [
        ...itemSlides,
        ...locSlides.filter(s => !usedSlugs.has(s.slug)),
    ];
    const gridLocations = locations.slice(0, 8);
    // Show loading screen until all data is ready
    if (!ready)
        return (_jsxs("div", { className: "min-h-screen bg-white flex flex-col items-center justify-center gap-4", children: [_jsx("div", { className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" }), _jsx("p", { className: "text-blue-500 font-semibold text-sm tracking-wide", children: "Smart Tourism" })] }));
    return (_jsxs("div", { className: "min-h-screen bg-white", children: [_jsxs("nav", { className: "fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-6 lg:px-10 h-14 flex items-center justify-between shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RiLeafLine, { size: 22, className: "text-blue-500" }), _jsx("span", { className: "font-extrabold text-slate-800 text-base tracking-tight", children: "Smart Tourism" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => navigate('/'), className: "px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition rounded-lg hover:bg-blue-50", children: "Home" }), _jsxs("button", { onClick: () => navigate('/gps'), className: "flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition rounded-lg hover:bg-blue-50", children: [_jsx(MdGpsFixed, { size: 15 }), " GPS"] }), _jsxs("button", { onClick: () => navigate('/admin'), className: "flex items-center gap-1.5 ml-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm shadow-blue-200", children: [_jsx(HiOutlineCog, { size: 15 }), " Admin"] })] })] }), _jsx("div", { className: "pt-14", children: _jsxs("div", { className: "max-w-[1400px] mx-auto px-4 lg:px-8 py-6", children: [_jsxs("div", { className: "flex gap-5 h-[520px]", children: [_jsx("div", { className: "flex-1 min-w-0 rounded-2xl overflow-hidden shadow-md relative group", children: slides.length > 0 ? (_jsx(Swiper, { modules: [Autoplay], autoplay: { delay: 3500, disableOnInteraction: false }, speed: 600, loop: true, slidesPerView: 1, className: "hero-swiper", children: slides.map((s, i) => (_jsxs(SwiperSlide, { onClick: () => navigate(s.catSlug ? `/items/${s.slug}` : `/locations/${s.slug}`), style: { cursor: 'pointer' }, children: [_jsx("img", { src: s.image, alt: s.title, style: {
                                                        position: 'absolute', inset: 0,
                                                        width: '100%', height: '100%',
                                                        objectFit: 'cover', display: 'block',
                                                        imageRendering: 'auto',
                                                        filter: 'none',
                                                    } }), _jsx("div", { style: {
                                                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%',
                                                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                                                        pointerEvents: 'none',
                                                    } }), s.catSlug && CAT_ICON[s.catSlug] && (_jsxs("div", { style: { position: 'absolute', top: 16, left: 16, pointerEvents: 'none' }, className: "flex items-center gap-1.5 bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow", children: [CAT_ICON[s.catSlug], _jsx("span", { className: "capitalize", children: s.catSlug })] })), _jsxs("div", { style: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', pointerEvents: 'none' }, children: [_jsx("p", { className: "text-white/90 text-sm font-medium mb-1", children: s.sub }), _jsx("h2", { className: "text-white text-2xl font-bold drop-shadow-lg", children: s.title }), _jsxs("div", { className: "mt-3 inline-flex items-center gap-2 bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow", children: ["Explore ", _jsx(HiChevronRight, { size: 13 })] })] })] }, i))) })) : (_jsxs("div", { className: "w-full h-full bg-blue-50 flex flex-col items-center justify-center gap-3 text-blue-200", children: [_jsx(MdPhotoCamera, { size: 48 }), _jsx("p", { className: "text-sm text-slate-400", children: "Loading featured content\u2026" })] })) }), _jsxs("div", { className: "w-[360px] flex-shrink-0 flex flex-col gap-1", children: [_jsxs("div", { className: "flex items-center justify-between mb-2 px-1", children: [_jsx("p", { className: "text-base font-bold text-slate-800", children: "Destinations" }), _jsxs("button", { onClick: () => navigate('/'), className: "text-xs text-blue-500 font-semibold hover:underline flex items-center gap-0.5", children: ["See all ", _jsx(HiChevronRight, { size: 12 })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-2 flex-1 content-start overflow-y-auto pr-1 custom-scroll", children: (gridLocations.length > 0 ? gridLocations : Array.from({ length: 4 }, (_, i) => ({ id: i, name: '—', slug: '', coverImage: null, _count: { items: 0 } }))).map(loc => (_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, transition: { type: 'spring', stiffness: 400, damping: 25 }, onClick: () => loc.slug && navigate(`/locations/${loc.slug}`), className: "relative rounded-xl overflow-hidden h-[116px] text-left shadow-sm border border-slate-100 group", children: [loc.coverImage ? (_jsx("img", { src: loc.coverImage, alt: loc.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" })) : (_jsx("div", { className: "w-full h-full bg-blue-50 flex items-center justify-center", children: _jsx(MdPark, { size: 28, className: "text-blue-200" }) })), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-3", children: [_jsx("p", { className: "text-white text-xs font-bold leading-tight line-clamp-1", children: loc.name }), _jsxs("p", { className: "text-white/60 text-[10px] mt-0.5", children: [locationItemCount(loc.id), " Features"] })] })] }, loc.id))) })] })] }), categories.length > 0 && (_jsxs("section", { className: "mt-8", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsx("p", { className: "text-base font-bold text-slate-800", children: "Browse by Category" }) }), _jsx("div", { className: "flex gap-2.5 overflow-x-auto pb-1 no-scrollbar", children: categories.map(cat => (_jsxs(motion.button, { whileHover: { y: -2 }, whileTap: { scale: 0.96 }, onClick: () => navigate(`/locations`), className: "flex-shrink-0 flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl px-4 py-2.5 transition shadow-sm", children: [_jsx("span", { className: "text-blue-500", children: CAT_ICON[cat.slug] ?? _jsx(MdAccountBalance, { size: 16 }) }), _jsx("span", { className: "text-xs text-slate-700 font-semibold whitespace-nowrap", children: cat.name }), cat._count?.items != null && cat._count.items > 0 && (_jsx("span", { className: "text-[10px] text-blue-400 font-bold bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full", children: cat._count.items }))] }, cat.id))) })] })), featuredItems.filter(i => i.featured).length > 0 && (_jsxs("section", { className: "mt-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-base font-bold text-slate-800", children: "Featured Attractions" }), _jsxs("button", { onClick: () => navigate('/locations'), className: "text-xs text-blue-500 font-semibold hover:underline flex items-center gap-0.5", children: ["View all ", _jsx(HiChevronRight, { size: 12 })] })] }), _jsx("div", { className: "flex gap-3 overflow-x-auto pb-2 no-scrollbar", children: featuredItems.filter(i => i.featured).map(item => (_jsxs(motion.button, { whileHover: { y: -3 }, whileTap: { scale: 0.98 }, transition: { type: 'spring', stiffness: 350 }, onClick: () => navigate(`/items/${item.slug}`), className: "flex-shrink-0 w-44 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm text-left group", children: [item.media[0] ? (_jsx("img", { src: item.media[0].url, alt: item.name, className: "w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500" })) : (_jsx("div", { className: "w-full h-28 bg-blue-50 flex items-center justify-center text-blue-200", children: CAT_ICON[item.category.slug] ?? _jsx(MdAccountBalance, { size: 28 }) })), _jsxs("div", { className: "p-3", children: [_jsx("p", { className: "text-xs font-bold text-slate-800 line-clamp-1", children: item.name }), _jsx("p", { className: "text-[10px] text-slate-400 mt-0.5 capitalize", children: item.category.name }), item.rating > 0 && (_jsxs("p", { className: "flex items-center gap-0.5 text-[10px] text-blue-500 font-semibold mt-1", children: [_jsx(HiStar, { size: 11, className: "text-amber-400" }), " ", item.rating.toFixed(1)] }))] })] }, item.id))) })] }))] }) }), _jsx(Footer, {})] }));
}
