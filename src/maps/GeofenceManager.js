import { jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useGPS } from '../hooks/useGPS';
import { useGeofence } from '../hooks/useGeofence';
import { checkZone } from '../services/geofenceService';
export default function GeofenceManager() {
    const { position } = useGPS();
    const [zones, setZones] = useState([]);
    const [note, setNote] = useState(null);
    useEffect(() => {
        if (!position)
            return;
        checkZone(position.lat, position.lng).then((res) => setZones(res));
    }, [position]);
    useGeofence(position?.lat ?? null, position?.lng ?? null, zones.map((z) => ({
        ...z,
        onEnter: () => {
            setNote(`You are near: ${z.name}`);
            new Audio(z.audioUrl).play().catch(() => null);
        },
    })));
    if (!note)
        return null;
    return (_jsxs("div", { className: "absolute bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-2xl px-5 py-3 z-50 text-sm font-medium text-gray-700", children: ["\uD83D\uDCCD ", note] }));
}
