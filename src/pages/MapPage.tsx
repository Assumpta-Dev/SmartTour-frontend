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

const TypeIcon = ({ type }: { type: string }) => {
  const cls = 'text-blue-400';
  if (type === 'animal')   return <MdPets size={20} className={cls} />;
  if (type === 'bird')     return <GiBirdCage size={20} className={cls} />;
  if (type === 'tree')     return <MdPark size={20} className={cls} />;
  if (type === 'landmark') return <MdAccountBalance size={20} className={cls} />;
  return <HiOutlineLocationMarker size={20} className={cls} />;
};

export default function MapPage() {
  const navigate = useNavigate();
  const { position } = useGPS();
  const { attractions } = useAttractions(position);
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(attractions.length / PAGE_SIZE);
  const paged = attractions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="h-screen flex flex-col bg-white">
      <NFCScanner />

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <h1 className="text-sm font-bold text-slate-800">Explore Nearby</h1>
          <p className={`text-xs flex items-center gap-1 mt-0.5 ${position ? 'text-green-500' : 'text-slate-400'}`}>
            {position ? <TbGps size={13} /> : <TbGps size={13} className="opacity-30" />}
            {position ? 'GPS active' : 'Locating…'}
          </p>
        </div>
        {attractions.length > 0 && (
          <button
            onClick={() => { setPanelOpen(v => !v); setPage(1); }}
            className="flex items-center gap-1.5 text-xs bg-blue-500 text-white px-3 py-1.5 rounded-full font-medium"
          >
            {panelOpen ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
            Nearby ({attractions.length})
          </button>
        )}
      </header>

      {/* Nearby panel */}
      {panelOpen && attractions.length > 0 && (
        <div className="bg-white border-b border-slate-100 z-10">
          {paged.map((obj) => (
            <button
              key={obj.id}
              onClick={() => navigate(`/object/${obj.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 border-b border-slate-50 text-left transition"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <TypeIcon type={obj.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{obj.name}</p>
                <p className="text-xs text-slate-400 capitalize">{obj.type}</p>
              </div>
              <HiChevronRight size={16} className="text-slate-300 flex-shrink-0" />
            </button>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-xs text-slate-500 disabled:opacity-30 hover:text-blue-500 transition"
              >
                <HiChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs text-slate-400">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-xs text-slate-500 disabled:opacity-30 hover:text-blue-500 transition"
              >
                Next <HiChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <TourMap />
        <GeofenceManager />
      </div>
    </div>
  );
}
