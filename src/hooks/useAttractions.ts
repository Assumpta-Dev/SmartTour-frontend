import { useState, useEffect } from 'react';
import { fetchNearby, type TourObject } from '../services/objectService';
import { cacheGet } from '../utils/cache';

export function useAttractions(position: { lat: number; lng: number } | null) {
  const [attractions, setAttractions] = useState<TourObject[]>(() => {
    if (!position) return [];
    return cacheGet<TourObject[]>(
      `nearby_${position.lat.toFixed(3)}_${position.lng.toFixed(3)}_200`
    ) ?? [];
  });

  useEffect(() => {
    if (!position) return;
    fetchNearby(position.lat, position.lng)
      .then(setAttractions)
      .catch(() => null);
  }, [position?.lat, position?.lng]);

  return { attractions };
}
