import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiLocationMarker, HiRefresh, HiVolumeUp } from 'react-icons/hi';
import { MdPark } from 'react-icons/md';
import { fetchNearbyLocations, type Location } from '../services/tourismService';
import { checkGeofence, type Zone } from '../services/geofenceService';
import { speak } from '../audio/ttsService';
import 'leaflet/dist/leaflet.css';

export default function GPSPage() {
  const navigate    = useNavigate();
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafletMap  = useRef<any>(null);
  const markersRef  = useRef<any[]>([]);

  const [coords,      setCoords]      = useState<{ lat: number; lng: number } | null>(null);
  const [nearby,      setNearby]      = useState<(Location & { distance: number })[]>([]);
  const [activeZones, setActiveZones] = useState<Zone[]>([]);
  const [error,       setError]       = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [panelOpen,   setPanelOpen]   = useState(true);
  const spokenZones   = useRef<Set<number>>(new Set());
  const hasRealGPS     = useRef(false);

  const loadNearby = useCallback(async (lat: number, lng: number) => {
    try {
      const [locs, zones] = await Promise.all([
        fetchNearbyLocations(lat, lng, 50000),
        checkGeofence(lat, lng),
      ]);
      setNearby(locs);
      setActiveZones(zones);
      // Only speak if we have real GPS and user is actually inside a zone
      if (hasRealGPS.current) {
        zones.forEach(z => {
          if (z.triggerAudio && !spokenZones.current.has(z.id)) {
            speak(z.triggerAudio);
            spokenZones.current.add(z.id);
          }
        });
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        hasRealGPS.current = true;
        setCoords({ lat, lng });
        loadNearby(lat, lng);
        setLoading(false);
      },
      () => {
        const lat = -1.9441, lng = 30.0619;
        setCoords({ lat, lng });
        loadNearby(lat, lng);
        setLoading(false);
        setError('Location access denied — showing Kigali area.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [loadNearby]);

  useEffect(() => {
    if (!coords || !mapRef.current || leafletMap.current) return;
    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      const map = L.map(mapRef.current!, { zoomControl: true, attributionControl: false })
        .setView([coords.lat, coords.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      const userIcon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ffeb00" stroke="black" stroke-width="2"/>
          <circle cx="12" cy="9" r="2.8" fill="black"/>
        </svg>`,
        className: '', iconAnchor: [18, 36],
      });
      L.marker([coords.lat, coords.lng], { icon: userIcon })
        .bindPopup('<b>You are here</b>').addTo(map);
      leafletMap.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    });
  }, [coords]);

  useEffect(() => {
    if (!leafletMap.current || nearby.length === 0) return;
    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      nearby.forEach(loc => {
        if (!loc.latitude || !loc.longitude) return;
        const m = L.marker([loc.latitude, loc.longitude])
          .bindPopup(`<b>${loc.name}</b><br/>${(loc.distance / 1000).toFixed(1)} km away`)
          .addTo(leafletMap.current);
        markersRef.current.push(m);
      });
    });
  }, [nearby]);

  const refresh = () => {
    if (!coords || !hasRealGPS.current) return;
    spokenZones.current.clear();
    loadNearby(coords.lat, coords.lng);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white">
      {/* Header Panel */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm z-50">
        <button onClick={() => navigate('/')}
          className="w-10 h-10 rounded-2xl bg-primary hover:bg-primary-dark flex items-center justify-center text-slate-900 transition-all active:scale-95 shadow-md">
          <HiArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-headings font-extrabold text-slate-900 tracking-tight">GPS Explorer</h1>
          {coords && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
            </p>
          )}
        </div>
        <button onClick={refresh}
          className="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-primary flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
          <HiRefresh size={20} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="relative flex-1 min-w-0">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 font-bold text-xs tracking-widest uppercase">Detecting Location...</p>
            </div>
          ) : (
            <div ref={mapRef} className="absolute inset-0" />
          )}

          {activeZones.length > 0 && (
            <div className="absolute top-6 left-6 right-6 z-[1000] space-y-3">
              {activeZones.map(z => (
                <div key={z.id} className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md bg-opacity-90">
                  <div>
                    <p className="font-headings font-bold text-lg tracking-tight text-primary">{z.zoneName}</p>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Active Geofence</p>
                  </div>
                  {z.triggerAudio && (
                    <button onClick={() => speak(z.triggerAudio!)}
                      className="w-12 h-12 rounded-2xl bg-primary text-slate-900 flex items-center justify-center hover:scale-110 transition shadow-lg">
                      <HiVolumeUp size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {panelOpen && (
          <div className="w-full sm:w-96 flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-hidden absolute inset-0 sm:relative sm:inset-auto z-40 sm:z-auto shadow-2xl sm:shadow-none">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <p className="font-headings font-bold text-slate-900">
                Nearby Attractions
                {nearby.length > 0 && <span className="ml-2 text-xs font-bold text-primary-dark bg-primary/20 px-2 py-0.5 rounded-full">{nearby.length}</span>}
              </p>
              <button onClick={() => setPanelOpen(false)} className="text-gray-400 hover:text-slate-900 sm:hidden">
                <HiArrowLeft className="rotate-180" size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {nearby.length === 0 && !loading ? (
                <div className="flex flex-col items-center py-24 text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                    <MdPark size={32} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest px-8">No destinations within 50km</p>
                </div>
              ) : (
                nearby.map(loc => (
                  <button key={loc.id} onClick={() => navigate(`/locations/${loc.slug}`)}
                    className="w-full flex items-center gap-4 bg-white border border-gray-100 hover:border-primary rounded-[28px] p-4 text-left shadow-sm hover:shadow-modern transition-all group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={loc.coverImage || 'https://picsum.photos/200/200?nature'} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-headings font-bold text-slate-900 text-sm truncate">{loc.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-accent font-bold text-[10px] uppercase tracking-widest">
                        <HiLocationMarker size={12} />
                        {(loc.distance / 1000).toFixed(1)} km
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
