import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { TbGps } from 'react-icons/tb';
import { MdPets, MdPark, MdAccountBalance } from 'react-icons/md';
import { GiBirdCage } from 'react-icons/gi';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import TourMap from '../components/map/TourMap';
import GeofenceManager from '../maps/GeofenceManager';
import NFCScanner from '../components/nfc/NFCScanner';
import { useGPS } from '../hooks/useGPS';
import { useAttractions } from '../hooks/useAttractions';
const PAGE_SIZE = 6;
const TypeIcon = ({ type }) => {
    const cls = 'text-blue-400';
    if (type === 'animal')
        return _jsx(MdPets, { size: 20, className: cls });
    if (type === 'bird')
        return _jsx(GiBirdCage, { size: 20, className: cls });
    if (type === 'tree')
        return _jsx(MdPark, { size: 20, className: cls });
    if (type === 'landmark')
        return _jsx(MdAccountBalance, { size: 20, className: cls });
    return _jsx(HiOutlineLocationMarker, { size: 20, className: cls });
};
export default function MapPage() {
    const navigate = useNavigate();
    const { position } = useGPS();
    const { attractions } = useAttractions(position);
    const [panelOpen, setPanelOpen] = useState(false);
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(attractions.length / PAGE_SIZE);
    const paged = attractions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return (_jsxs("div", { className: "h-screen flex flex-col bg-white", children: [_jsx(NFCScanner, {}), _jsxs("header", { className: "bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-sm font-bold text-slate-800", children: "Explore Nearby" }), _jsxs("p", { className: `text-xs flex items-center gap-1 mt-0.5 ${position ? 'text-green-500' : 'text-slate-400'}`, children: [position ? _jsx(TbGps, { size: 13 }) : _jsx(TbGps, { size: 13, className: "opacity-30" }), position ? 'GPS active' : 'Locating…'] })] }), attractions.length > 0 && (_jsxs("button", { onClick: () => { setPanelOpen(v => !v); setPage(1); }, className: "flex items-center gap-1.5 text-xs bg-blue-500 text-white px-3 py-1.5 rounded-full font-medium", children: [panelOpen ? _jsx(HiChevronUp, { size: 14 }) : _jsx(HiChevronDown, { size: 14 }), "Nearby (", attractions.length, ")"] }))] }), panelOpen && attractions.length > 0 && (_jsxs("div", { className: "bg-white border-b border-slate-100 z-10", children: [paged.map((obj) => (_jsxs("button", { onClick: () => navigate(`/object/${obj.id}`), className: "w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 border-b border-slate-50 text-left transition", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0", children: _jsx(TypeIcon, { type: obj.type }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-slate-800 truncate", children: obj.name }), _jsx("p", { className: "text-xs text-slate-400 capitalize", children: obj.type })] }), _jsx(HiChevronRight, { size: 16, className: "text-slate-300 flex-shrink-0" })] }, obj.id))), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between px-4 py-2 bg-slate-50", children: [_jsxs("button", { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: "flex items-center gap-1 text-xs text-slate-500 disabled:opacity-30 hover:text-blue-500 transition", children: [_jsx(HiChevronLeft, { size: 14 }), " Prev"] }), _jsxs("span", { className: "text-xs text-slate-400", children: [page, " / ", totalPages] }), _jsxs("button", { onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages, className: "flex items-center gap-1 text-xs text-slate-500 disabled:opacity-30 hover:text-blue-500 transition", children: ["Next ", _jsx(HiChevronRight, { size: 14 })] })] }))] })), _jsxs("div", { className: "flex-1 relative", children: [_jsx(TourMap, {}), _jsx(GeofenceManager, {})] })] }));
}
