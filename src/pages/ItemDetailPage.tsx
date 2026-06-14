import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  HiArrowLeft, HiHeart, HiOutlineHeart, HiChevronRight,
  HiVolumeUp, HiVolumeOff, HiPlay,
} from 'react-icons/hi';
import { MdPets, MdPark, MdAccountBalance, MdRestaurant, MdHotel, MdDirectionsWalk, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage, GiCampingTent } from 'react-icons/gi';
import { TbLeaf, TbClock } from 'react-icons/tb';
import { useRef } from 'react';
import { fetchItem, type Item } from '../services/tourismService';
import { Footer } from './HomePage';

type Tab = 'overview' | 'habitat' | 'conservation' | 'facts';

const CAT_ICON: Record<string, JSX.Element> = {
  animals:     <MdPets size={20} />,
  birds:       <GiBirdCage size={20} />,
  forests:     <MdPark size={20} />,
  plants:      <TbLeaf size={20} />,
  camping:     <GiCampingTent size={20} />,
  hotels:      <MdHotel size={20} />,
  restaurants: <MdRestaurant size={20} />,
  activities:  <MdDirectionsWalk size={20} />,
  attractions: <MdAccountBalance size={20} />,
};

function AudioBtn({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!ref.current) return;
    playing ? ref.current.pause() : ref.current.play();
    setPlaying(p => !p);
  };
  return (
    <button onClick={toggle}
      className={`flex items-center gap-3 w-full px-5 py-4 rounded-2xl border transition active:scale-95 ${
        playing ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-blue-200 text-blue-500 hover:bg-blue-50'
      }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${playing ? 'bg-white/20' : 'bg-blue-50'}`}>
        {playing ? <HiVolumeUp size={20} /> : <HiVolumeOff size={20} />}
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold">{playing ? 'Pause Narration' : 'Listen to Narration'}</p>
        <p className={`text-xs mt-0.5 ${playing ? 'text-blue-100' : 'text-slate-400'}`}>
          {playing ? 'Playing audio guide…' : 'Tap to hear the audio guide'}
        </p>
      </div>
      <audio ref={ref} src={src} onEnded={() => setPlaying(false)} />
    </button>
  );
}

export default function ItemDetailPage() {
  const { slug }  = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const [item,  setItem]  = useState<Item | null>(null);
  const [tab,   setTab]   = useState<Tab>('overview');
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchItem(slug).then(setItem).catch(() => setError(true));
    const favs: string[] = JSON.parse(localStorage.getItem('favourites') ?? '[]');
    setSaved(favs.includes(slug));
  }, [slug]);

  const toggleFav = () => {
    const favs: string[] = JSON.parse(localStorage.getItem('favourites') ?? '[]');
    const next = saved ? favs.filter(f => f !== slug) : [...favs, slug!];
    localStorage.setItem('favourites', JSON.stringify(next));
    setSaved(!saved);
  };

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <MdOutlinePlace size={48} className="text-blue-100" />
      <p className="text-slate-500">Item not found.</p>
      <button onClick={() => navigate(-1)} className="text-blue-500 text-sm underline">Go back</button>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',     label: 'Overview'     },
    { key: 'habitat',      label: 'Habitat'      },
    { key: 'conservation', label: 'Conservation' },
    { key: 'facts',        label: 'Facts'        },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">

        {/* Sticky header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-50 px-5 py-3.5 flex items-center justify-between shadow-sm">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 transition">
            <HiArrowLeft size={18} />
          </button>
          <span className="font-bold text-slate-800 text-sm truncate mx-3 flex-1">{item.name}</span>
          <button onClick={toggleFav}
            className="w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition">
            {saved
              ? <HiHeart size={18} className="text-blue-500" />
              : <HiOutlineHeart size={18} className="text-slate-400" />
            }
          </button>
        </div>

        {/* Image slider — left to right */}
        {item.media.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            speed={600}
            slidesPerView={1}
            className="w-full"
            style={{ height: '280px' }}
          >
            {item.media.map(m => (
              <SwiperSlide key={m.id}>
                {m.type === 'video'
                  ? <video src={m.url} controls className="w-full h-full object-cover" />
                  : <img src={m.url} alt={m.caption ?? item.name} className="w-full h-full object-cover" />
                }
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-64 bg-blue-50 flex items-center justify-center text-blue-200">
            {CAT_ICON[item.category.slug] ?? <MdOutlinePlace size={48} />}
          </div>
        )}

        <div className="px-5 py-6 space-y-6">

          {/* Title block */}
          <div className="bg-blue-50 rounded-3xl px-5 py-4">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              {CAT_ICON[item.category.slug] ?? <MdOutlinePlace size={18} />}
              <span className="text-xs font-semibold uppercase tracking-wider">{item.category.name} · {item.location.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">{item.name}</h1>
            {item.duration && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <TbClock size={13} /> {item.duration}
              </p>
            )}
            {item.rating > 0 && (
              <p className="flex items-center gap-1 text-xs text-amber-500 mt-1.5 font-semibold">
                {'⭐'.repeat(Math.round(item.rating))} {item.rating.toFixed(1)} / 5
              </p>
            )}
          </div>

          {/* Audio narration */}
          {item.audioUrl && <AudioBtn src={item.audioUrl} />}

          {/* Overview video */}
          {item.videoUrl && (
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                <HiPlay size={16} className="text-blue-500" /> Video Overview
              </p>
              <video src={item.videoUrl} controls className="w-full rounded-3xl border border-slate-100 shadow-sm" />
            </div>
          )}

          {/* Tabs */}
          <div>
            <div className="flex bg-blue-50 rounded-2xl p-1 gap-1 mb-5">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                    tab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >{t.label}</button>
              ))}
            </div>
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-600 text-sm leading-relaxed bg-white rounded-3xl border border-slate-100 px-5 py-4 min-h-[80px]"
            >
              {tab === 'overview'     && <p>{item.description}</p>}
              {tab === 'habitat'      && <p>{item.habitat      ?? 'No habitat information available.'}</p>}
              {tab === 'conservation' && <p>{item.conservation ?? 'No conservation information available.'}</p>}
              {tab === 'facts'        && <p style={{ whiteSpace: 'pre-line' }}>{item.facts ?? 'No facts available.'}</p>}
            </motion.div>
          </div>

          {/* Related items */}
          {item.related && item.related.length > 0 && (
            <div className="pb-8">
              <p className="text-base font-bold text-slate-800 mb-4">You May Also Like</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.related.map(r => (
                  <motion.button
                    key={r.id}
                    whileHover={{ y: -3 }}
                    onClick={() => navigate(`/items/${r.slug}`)}
                    className="flex-shrink-0 w-36 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm text-left"
                  >
                    {r.media[0]
                      ? <img src={r.media[0].url} alt={r.name} className="w-full h-24 object-cover" />
                      : <div className="w-full h-24 bg-blue-50 flex items-center justify-center text-blue-200">
                          {CAT_ICON[r.category.slug] ?? <MdOutlinePlace size={24} />}
                        </div>
                    }
                    <div className="p-3">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2">{r.name}</p>
                      <p className="flex items-center gap-0.5 text-xs text-blue-500 mt-1">
                        View <HiChevronRight size={11} />
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
