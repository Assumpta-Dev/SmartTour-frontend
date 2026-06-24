import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiArrowLeft, HiLocationMarker, HiVolumeUp, HiVolumeOff,
  HiLightBulb, HiChevronRight,
} from 'react-icons/hi';
import { MdPets, MdPark, MdAccountBalance, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

import LanguageSelector from '../components/common/LanguageSelector';
import { fetchObject, fetchByNfc, fetchByQr, fetchNearby, type TourObject } from '../services/objectService';

const TYPE_ICON: Record<string, JSX.Element> = {
  animal:   <MdPets />,
  bird:     <GiBirdCage />,
  tree:     <MdPark />,
  landmark: <MdAccountBalance />,
};

const TYPE_LABEL: Record<string, Record<string, string>> = {
  animal:   { en: 'Animal',   fr: 'Animal',   rw: 'Inyamaswa' },
  bird:     { en: 'Bird',     fr: 'Oiseau',   rw: 'Inyoni' },
  tree:     { en: 'Tree',     fr: 'Arbre',    rw: 'Igiti' },
  landmark: { en: 'Landmark', fr: 'Monument', rw: 'Akaranga' },
};

export default function ObjectPage() {
  const { id, nfcId, qrCode } = useParams<{ id?: string; nfcId?: string; qrCode?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [object,  setObject]  = useState<TourObject | null>(null);
  const [nearby,  setNearby]  = useState<TourObject[]>([]);
  const [error,   setError]   = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const obj = id      ? await fetchObject(id)
                  : nfcId   ? await fetchByNfc(nfcId)
                  : qrCode  ? await fetchByQr(qrCode)
                  : null;
        if (!obj) throw new Error();
        setObject(obj);
        fetchNearby(obj.latitude, obj.longitude, 500)
          .then(list => setNearby(list.filter(n => n.id !== obj.id).slice(0, 4)))
          .catch(() => null);
      } catch { setError(t('notFound')); }
    })();
  }, [id, nfcId, qrCode, t]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(p => !p);
  };

  const lang = ['en', 'fr', 'rw'].includes(i18n.language) ? i18n.language : 'en';

  if (!object && !error) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const typeLabel = object ? (TYPE_LABEL[object.type]?.[lang] ?? object.type) : '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white min-h-screen shadow-modern overflow-hidden flex flex-col">
        
        {/* Header Image */}
        <div className="relative h-96 flex-shrink-0">
          <img 
            src={object?.imageUrl || 'https://picsum.photos/800/800?nature'} 
            alt={object?.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
             <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all">
                <HiArrowLeft size={24} />
             </button>
             <LanguageSelector />
          </div>

          <div className="absolute bottom-8 left-8 right-8 space-y-3">
             <div className="flex items-center gap-2">
               <span className="bg-primary text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                 {object && TYPE_ICON[object.type]} {typeLabel}
               </span>
             </div>
             <h1 className="text-4xl md:text-5xl font-headings font-extrabold text-white tracking-tighter drop-shadow-lg">
               {object?.name}
             </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-12 space-y-12">
          
          <div className="space-y-6">
            <div className="flex items-center gap-6 py-4 border-y border-gray-100">
               <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                  <HiLocationMarker className="text-primary-dark" size={18} />
                  <span>{object?.latitude.toFixed(4)}°N, {object?.longitude.toFixed(4)}°E</span>
               </div>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed">
              {object?.description}
            </p>
          </div>

          {object?.audioUrl && (
            <button 
              onClick={toggleAudio}
              className={`flex items-center gap-5 w-full p-6 rounded-[32px] border-2 transition-all active:scale-95 shadow-xl ${
                playing ? 'bg-primary border-primary text-slate-900' : 'bg-white border-gray-100 text-slate-700 hover:border-primary'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${playing ? 'bg-black/10' : 'bg-primary/10 text-primary-dark'}`}>
                {playing ? <HiVolumeUp size={28} /> : <HiVolumeOff size={28} />}
              </div>
              <div className="text-left flex-grow">
                <p className="text-lg font-headings font-bold leading-tight">{playing ? 'Guide Playing' : 'Experience the Narrative'}</p>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">
                  {playing ? 'Immersive Audio Guide' : 'Tap to hear the story'}
                </p>
              </div>
              <audio ref={audioRef} src={object.audioUrl} onEnded={() => setPlaying(false)} />
            </button>
          )}

          {/* Nearby Section */}
          {nearby.length > 0 && (
            <div className="space-y-8">
               <h3 className="text-2xl font-headings font-extrabold text-slate-900 italic tracking-tighter border-l-4 border-primary pl-4">
                 Discover Nearby
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {nearby.map(n => (
                   <motion.button 
                     key={n.id}
                     whileHover={{ y: -4 }}
                     onClick={() => navigate(`/object/${n.id}`)}
                     className="flex items-center gap-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 p-4 rounded-3xl transition-all shadow-sm hover:shadow-modern text-left group"
                   >
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-dark shadow-sm group-hover:bg-primary transition-colors">
                        {TYPE_ICON[n.type] || <MdOutlinePlace size={24} />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{n.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{TYPE_LABEL[n.type]?.[lang] ?? n.type}</p>
                     </div>
                   </motion.button>
                 ))}
               </div>
            </div>
          )}

          {/* Fact Card */}
          <div className="bg-dark rounded-[40px] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-all" />
            <div className="relative z-10 flex gap-6">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-slate-900 flex-shrink-0">
                <HiLightBulb size={24} />
              </div>
              <div className="space-y-2">
                <p className="text-primary font-headings font-bold text-xs uppercase tracking-widest">Digital Insights</p>
                <p className="text-gray-300 leading-relaxed italic">
                  "Every stone and leaf in this sanctuary tells a story of survival and heritage. Our digital guides help you listen."
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
