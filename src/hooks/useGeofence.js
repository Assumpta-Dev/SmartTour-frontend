import { useEffect } from 'react';
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const f1 = (lat1 * Math.PI) / 180, f2 = (lat2 * Math.PI) / 180;
    const df = ((lat2 - lat1) * Math.PI) / 180, dl = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function useGeofence(lat, lng, zones) {
    useEffect(() => {
        if (lat === null || lng === null)
            return;
        zones.forEach((z) => { if (haversine(lat, lng, z.latitude, z.longitude) <= z.radius)
            z.onEnter(); });
    }, [lat, lng]);
}
