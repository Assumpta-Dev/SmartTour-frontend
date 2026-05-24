import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGPS } from '../../hooks/useGPS';
import { useAttractions } from '../../hooks/useAttractions';
// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const userIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    className: 'hue-rotate-[200deg]',
});
function RecenterMap({ lat, lng }) {
    const map = useMap();
    const moved = useRef(false);
    useEffect(() => {
        if (!moved.current) {
            map.setView([lat, lng], 17);
            moved.current = true;
        }
    }, [lat, lng]);
    return null;
}
export default function TourMap() {
    const navigate = useNavigate();
    const { position } = useGPS();
    const { attractions } = useAttractions(position);
    const defaultCenter = [-1.9441, 30.0619];
    return (_jsxs(MapContainer, { center: defaultCenter, zoom: 16, className: "h-full w-full", children: [_jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "\u00A9 OpenStreetMap contributors" }), position && (_jsxs(_Fragment, { children: [_jsx(RecenterMap, { lat: position.lat, lng: position.lng }), _jsx(Marker, { position: [position.lat, position.lng], icon: userIcon, children: _jsx(Popup, { children: "\uD83D\uDCCD You are here" }) }), _jsx(Circle, { center: [position.lat, position.lng], radius: position.accuracy, pathOptions: { color: '#60a5fa', fillColor: '#60a5fa', fillOpacity: 0.1 } })] })), attractions.map((obj) => (_jsx(Marker, { position: [obj.latitude, obj.longitude], children: _jsx(Popup, { children: _jsxs("div", { className: "text-center min-w-[140px]", children: [obj.imageUrl && (_jsx("img", { src: obj.imageUrl, alt: obj.name, className: "w-full h-20 object-cover rounded mb-1" })), _jsx("p", { className: "font-semibold text-gray-800 text-sm", children: obj.name }), _jsx("p", { className: "text-xs text-gray-500 capitalize mb-2", children: obj.type }), _jsx("button", { onClick: () => navigate(`/object/${obj.id}`), className: "bg-blue-400 text-white text-xs px-3 py-1 rounded-lg w-full", children: "View Details" })] }) }) }, obj.id)))] }));
}
