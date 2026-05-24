import { useEffect, useState } from 'react';
import { useGPS }      from '../hooks/useGPS';
import { useGeofence } from '../hooks/useGeofence';
import { checkZone }   from '../services/geofenceService';

interface Zone { id: string; name: string; latitude: number; longitude: number; radius: number; audioUrl: string }

export default function GeofenceManager() {
  const { position } = useGPS();
  const [zones, setZones] = useState<Zone[]>([]);
  const [note, setNote]   = useState<string | null>(null);

  useEffect(() => {
    if (!position) return;
    checkZone(position.lat, position.lng).then((res: Zone[]) => setZones(res));
  }, [position]);

  useGeofence(
    position?.lat ?? null, position?.lng ?? null,
    zones.map((z) => ({
      ...z,
      onEnter: () => {
        setNote(`You are near: ${z.name}`);
        new Audio(z.audioUrl).play().catch(() => null);
      },
    }))
  );

  if (!note) return null;
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-2xl px-5 py-3 z-50 text-sm font-medium text-gray-700">
      📍 {note}
    </div>
  );
}
