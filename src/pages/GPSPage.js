import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiLocationMarker, HiRefresh, HiVolumeUp } from 'react-icons/hi';
import { MdPark } from 'react-icons/md';
import { fetchNearbyLocations } from '../services/tourismService';
import { checkGeofence } from '../services/geofenceService';
import { speak } from '../audio/ttsService';
import 'leaflet/dist/leaflet.css';
export default function GPSPage() {
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const leafletMap = useRef(null);
    const markersRef = useRef([]);
    const [coords, setCoords] = useState(null);
    const [nearby, setNearby] = useState([]);
    const [activeZones, setActiveZones] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [panelOpen, setPanelOpen] = useState(true);
    const spokenZones = useRef(new Set());
    const loadNearby = useCallback(async (lat, lng) => {
        try {
            const [locs, zones] = await Promise.all([
                fetchNearbyLocations(lat, lng, 50000),
                checkGeofence(lat, lng),
            ]);
            setNearby(locs);
            setActiveZones(zones);
            zones.forEach(z => {
                if (z.triggerAudio && !spokenZones.current.has(z.id)) {
                    speak(z.triggerAudio);
                    spokenZones.current.add(z.id);
                }
            });
        }
        catch { /* silent */ }
    }, []);
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported.');
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude: lat, longitude: lng } = pos.coords;
            setCoords({ lat, lng });
            loadNearby(lat, lng);
            setLoading(false);
        }, () => {
            const lat = -1.9441, lng = 30.0619;
            setCoords({ lat, lng });
            loadNearby(lat, lng);
            setLoading(false);
            setError('Location access denied — showing Kigali area.');
        }, { enableHighAccuracy: true, timeout: 10000 });
    }, [loadNearby]);
    useEffect(() => {
        if (!coords || !mapRef.current || leafletMap.current)
            return;
        import('leaflet').then(L => {
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
                .setView([coords.lat, coords.lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            const userIcon = L.divIcon({
                html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#22c55e" stroke="white" stroke-width="1.5"/>
          <circle cx="12" cy="9" r="2.8" fill="white"/>
        </svg>`,
                className: '', iconAnchor: [18, 36],
            });
            L.marker([coords.lat, coords.lng], { icon: userIcon })
                .bindPopup('<b>You are here</b>').addTo(map);
            leafletMap.current = map;
            // force correct size after mount
            setTimeout(() => map.invalidateSize(), 100);
        });
    }, [coords]);
    useEffect(() => {
        if (!leafletMap.current || nearby.length === 0)
            return;
        import('leaflet').then(L => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            nearby.forEach(loc => {
                if (!loc.latitude || !loc.longitude)
                    return;
                const m = L.marker([loc.latitude, loc.longitude])
                    .bindPopup(`<b>${loc.name}</b><br/>${(loc.distance / 1000).toFixed(1)} km away`)
                    .addTo(leafletMap.current);
                markersRef.current.push(m);
            });
        });
    }, [nearby]);
    const refresh = () => {
        if (!coords)
            return;
        spokenZones.current.clear();
        loadNearby(coords.lat, coords.lng);
    };
    return (_jsxs("div", { className: "h-screen w-screen overflow-hidden flex flex-col bg-white", children: [_jsxs("div", { className: "flex-shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm z-50", children: [_jsx("button", { onClick: () => navigate('/'), className: "w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 transition flex-shrink-0", children: _jsx(HiArrowLeft, { size: 18 }) }), _jsx("span", { className: "font-bold text-slate-800 flex-1 text-sm", children: "GPS Explorer" }), coords && (_jsxs("p", { className: "text-xs text-slate-400 hidden sm:block", children: [coords.lat.toFixed(4), ", ", coords.lng.toFixed(4)] })), _jsx("button", { onClick: refresh, className: "w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 transition", children: _jsx(HiRefresh, { size: 18 }) })] }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsxs("div", { className: "relative flex-1 min-w-0", children: [loading ? (_jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center bg-blue-50 gap-3", children: [_jsx("div", { className: "w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" }), _jsx("p", { className: "text-sm text-blue-400 font-medium", children: "Getting your location\u2026" })] })) : (_jsx("div", { ref: mapRef, className: "absolute inset-0" })), error && (_jsxs("div", { className: "absolute bottom-4 left-4 right-4 z-[1000] bg-white border border-amber-200 text-amber-700 text-xs rounded-2xl px-4 py-3 shadow-md", children: [_jsx(HiLocationMarker, { size: 13, className: "inline mr-1" }), error] })), activeZones.length > 0 && (_jsx("div", { className: "absolute top-4 left-4 right-4 z-[1000] space-y-2", children: activeZones.map(z => (_jsxs("div", { className: "bg-blue-500 text-white rounded-2xl px-4 py-3 shadow-md flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-sm", children: z.zoneName }), _jsx("p", { className: "text-xs text-blue-100", children: "You are inside this zone" })] }), z.triggerAudio && (_jsx("button", { onClick: () => speak(z.triggerAudio), className: "w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition", children: _jsx(HiVolumeUp, { size: 16 }) }))] }, z.id))) })), _jsx("button", { onClick: () => setPanelOpen(v => !v), className: "absolute bottom-4 right-4 z-[1000] bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-md transition sm:hidden", children: panelOpen ? 'Hide' : `Nearby (${nearby.length})` })] }), panelOpen && (_jsxs("div", { className: "w-full sm:w-80 flex-shrink-0 border-l border-slate-100 bg-white flex flex-col overflow-hidden absolute inset-0 sm:relative sm:inset-auto z-40 sm:z-auto", children: [_jsxs("div", { className: "px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0", children: [_jsxs("p", { className: "text-sm font-bold text-slate-800", children: ["Nearby", nearby.length > 0 && _jsxs("span", { className: "ml-1.5 text-xs font-normal text-slate-400", children: ["(", nearby.length, ")"] })] }), _jsx("button", { onClick: () => setPanelOpen(false), className: "text-slate-400 hover:text-slate-600 text-xs sm:hidden", children: "Close" })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-3 space-y-2", children: nearby.length === 0 && !loading ? (_jsxs("div", { className: "flex flex-col items-center py-12 text-slate-400 gap-3", children: [_jsx(MdPark, { size: 36, className: "text-blue-100" }), _jsx("p", { className: "text-sm text-center", children: "No destinations found within 50 km." })] })) : (nearby.map(loc => (_jsxs("button", { onClick: () => navigate(`/locations/${loc.slug}`), className: "w-full flex items-center gap-3 bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50 rounded-2xl p-3 text-left shadow-sm transition", children: [loc.coverImage
                                            ? _jsx("img", { src: loc.coverImage, alt: loc.name, className: "w-12 h-12 rounded-xl object-cover flex-shrink-0" })
                                            : _jsx("div", { className: "w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-200", children: _jsx(MdPark, { size: 22 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-slate-800 text-sm truncate", children: loc.name }), _jsxs("p", { className: "text-xs text-blue-500 font-medium mt-0.5", children: [_jsx(HiLocationMarker, { size: 11, className: "inline mr-0.5" }), (loc.distance / 1000).toFixed(1), " km away"] })] })] }, loc.id)))) })] }))] })] }));
}
