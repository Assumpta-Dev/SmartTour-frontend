import { useState, useEffect } from 'react';
import { fetchNearby } from '../services/objectService';
import { cacheGet } from '../utils/cache';
export function useAttractions(position) {
    const [attractions, setAttractions] = useState(() => {
        if (!position)
            return [];
        return cacheGet(`nearby_${position.lat.toFixed(3)}_${position.lng.toFixed(3)}_200`) ?? [];
    });
    useEffect(() => {
        if (!position)
            return;
        fetchNearby(position.lat, position.lng)
            .then(setAttractions)
            .catch(() => null);
    }, [position?.lat, position?.lng]);
    return { attractions };
}
