import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGPS } from '../../hooks/useGPS';
import { useAttractions } from '../../hooks/useAttractions';
import { HiLocationMarker } from 'react-icons/hi';
import type { TourObject } from '../../services/objectService';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  className: 'hue-rotate-[200deg]',
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) { map.setView([lat, lng], 17); moved.current = true; }
  }, [lat, lng]);
  return null;
}

export default function TourMap() {
  const navigate = useNavigate();
  const { position } = useGPS();
  const { attractions } = useAttractions(position);
  const defaultCenter: [number, number] = [-1.9441, 30.0619];

  return (
    <MapContainer center={defaultCenter} zoom={16} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {position && (
        <>
          <RecenterMap lat={position.lat} lng={position.lng} />
          <Marker position={[position.lat, position.lng]} icon={userIcon}>
            <Popup><HiLocationMarker size={14} style={{display:'inline',color:'#3b82f6'}} /> You are here</Popup>
          </Marker>
          <Circle
            center={[position.lat, position.lng]}
            radius={position.accuracy}
            pathOptions={{ color: '#60a5fa', fillColor: '#60a5fa', fillOpacity: 0.1 }}
          />
        </>
      )}

      {(attractions as TourObject[]).map((obj) => (
        <Marker key={obj.id} position={[obj.latitude, obj.longitude]}>
          <Popup>
            <div className="text-center min-w-[140px]">
              {obj.imageUrl && (
                <img src={obj.imageUrl} alt={obj.name} className="w-full h-20 object-cover rounded mb-1" />
              )}
              <p className="font-semibold text-gray-800 text-sm">{obj.name}</p>
              <p className="text-xs text-gray-500 capitalize mb-2">{obj.type}</p>
              <button
                onClick={() => navigate(`/object/${obj.id}`)}
                className="bg-blue-400 text-white text-xs px-3 py-1 rounded-lg w-full"
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
