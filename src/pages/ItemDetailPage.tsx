import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCreative } from 'swiper/modules';
import {
  HiHeart, HiOutlineHeart, HiVolumeUp, HiVolumeOff,
  HiPlay, HiLocationMarker, HiStar
} from 'react-icons/hi';
import { MdOutlinePlace } from 'react-icons/md';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { fetchItem, type Item } from '../services/tourismService';

type Tab = 'overview' | 'habitat' | 'conservation' | 'facts';

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
      className={`flex items-center gap-4 w-full p-6 rounded-3xl border-2 transition-all active:scale-95 shadow-lg ${
        playing ? 'bg-primary border-primary text-slate-900' : 'bg-white border-gray-100 text-slate-700 hover:border-primary'
      }`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${playing ? 'bg-black/10' : 'bg-primary/10 text-primary-dark'}`}>
        {playing ? <HiVolumeUp size={24} /> : <HiVolumeOff size={24} />}
      </div>
      <div className="text-left flex-grow">
        <p className="text-base font-headings font-bold">{playing ? 'Currently Listening' : 'Audio Narrative Guide'}</p>
        <p className="text-xs font-medium uppercase tracking-widest mt-1 opacity-60">
          {playing ? 'Experience the story...' : 'Tap to play audio guide'}
        </p>
      </div>
      <audio ref={ref} src={src} onEnded={() => setPlaying(false)} />
    </button>
  );
}

export default function ItemDetailPage() {
  const { slug }  = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const [item,       setItem]       = useState<Item | null>(null);
  const [tab,        setTab]        = useState<Tab>('overview');
  const [ready,      setReady]      = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverStar,  setHoverStar]  = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetchItem(slug).then(res => {
      setItem(res);
      setReady(true);
    }).catch(() => navigate('/'));

    const favs: string[] = JSON.parse(localStorage.getItem('favourites') ?? '[]');
    setSaved(favs.includes(slug));

    const savedRating = localStorage.getItem(`rating_${slug}`);
    if (savedRating) setUserRating(Number(savedRating));
  }, [slug, navigate]);

  const toggleFav = () => {
    const favs: string[] = JSON.parse(localStorage.getItem('favourites') ?? '[]');
    const next = saved ? favs.filter(f => f !== slug) : [...favs, slug!];
    localStorage.setItem('favourites', JSON.stringify(next));
    setSaved(!saved);
  };

  const handleRate = (star: number) => {
    setUserRating(star);
    localStorage.setItem(`rating_${slug}`, String(star));
  };

  if (!ready || !item) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',     label: 'Overview'     },
    { key: 'habitat',      label: 'Habitat'      },
    { key: 'conservation', label: 'Conservation' },
    { key: 'facts',        label: 'Facts'        },
  ];

  return (
    <div className="bg-white pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Media Section */}
          <div className="space-y-8">
            <div className="rounded-[40px] overflow-hidden shadow-modern relative group">
              <button
                onClick={toggleFav}
                className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white transition-all hover:text-accent"
              >
                {saved ? <HiHeart size={24} className="text-accent" /> : <HiOutlineHeart size={24} />}
              </button>

              {item.media.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination, EffectCreative]}
                  navigation
                  pagination={{ clickable: true }}
                  effect="creative"
                  creativeEffect={{
                    prev: { shadow: true, translate: [0, 0, -400] },
                    next: { translate: ['100%', 0, 0] },
                  }}
                  className="w-full aspect-[4/3] lg:aspect-square"
                >
                  {item.media.map(m => (
                    <SwiperSlide key={m.id}>
                      <img src={m.url} alt={m.caption ?? item.name} className="w-full h-full object-cover" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="w-full aspect-square bg-gray-50 flex items-center justify-center text-gray-200">
                  <MdOutlinePlace size={80} />
                </div>
              )}
            </div>

            {item.audioUrl && <AudioBtn src={item.audioUrl} />}

            {item.videoUrl && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HiPlay className="text-primary-dark" size={24} />
                  <h3 className="font-headings font-bold text-lg">Cinematic Experience</h3>
                </div>
                <div className="rounded-[32px] overflow-hidden shadow-lg border border-gray-100">
                  <video src={item.videoUrl} controls className="w-full" />
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-10 lg:sticky lg:top-32">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/20 text-primary-dark text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-primary/30">
                  {item.category.name}
                </span>
                <span className="bg-gray-50 text-gray-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
                  Top Rated
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-headings font-extrabold text-slate-900 tracking-tighter leading-tight">
                {item.name}
              </h1>

              <div className="flex flex-wrap items-center gap-8 py-4 border-y border-gray-100">
                {/* Interactive star rating */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => handleRate(star)}
                        className="transition-transform hover:scale-125 active:scale-95"
                      >
                        <HiStar
                          size={24}
                          className={star <= (hoverStar || userRating) ? 'text-primary-dark' : 'text-gray-200'}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {userRating > 0 ? `Your rating: ${userRating}/5` : 'Tap to rate'}
                    {item.rating > 0 && ` · Avg ${item.rating.toFixed(1)}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <HiLocationMarker size={20} />
                  <span className="font-bold">{item.location.name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex border-b border-gray-100">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-6 py-4 text-sm font-bold transition-all relative ${
                      tab === t.key ? 'text-slate-900' : 'text-gray-400 hover:text-slate-600'
                    }`}
                  >
                    {t.label}
                    {tab === t.key && (
                      <motion.div layoutId="itemTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-gray-500 text-lg leading-relaxed"
                >
                  {tab === 'overview'     && <p>{item.description}</p>}
                  {tab === 'habitat'      && <p>{item.habitat      || 'Deep within the lush forests of Rwanda.'}</p>}
                  {tab === 'conservation' && <p>{item.conservation || 'Protected with utmost care by RDB.'}</p>}
                  {tab === 'facts'        && <p className="whitespace-pre-line">{item.facts || 'Known for its incredible intelligence and beauty.'}</p>}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={toggleFav}
                className={`w-full border-2 rounded-3xl py-4 flex items-center justify-center gap-2 font-bold transition-all shadow-sm ${
                  saved ? 'bg-accent border-accent text-white' : 'border-gray-100 text-slate-900 hover:bg-gray-50'
                }`}
              >
                {saved ? <HiHeart size={24} /> : <HiOutlineHeart size={24} />}
                {saved ? 'Saved to Favorites' : 'Add to Favorites'}
              </button>
            </div>
          </div>

        </div>

        {/* Related Section */}
        {item.related && item.related.length > 0 && (
          <section className="mt-32 space-y-12">
            <h3 className="text-3xl font-headings font-extrabold text-slate-900 italic tracking-tighter">You May Also Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {item.related.map(r => (
                <motion.div
                  key={r.id}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/items/${r.slug}`)}
                  className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-modern transition-all cursor-pointer group"
                >
                  <div className="h-48 overflow-hidden">
                    <img src={r.media[0]?.url || 'https://picsum.photos/400/400?nature'} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h4 className="font-headings font-bold text-slate-900 mb-2">{r.name}</h4>
                    <p className="text-xs text-primary-dark font-bold uppercase tracking-widest italic">{r.category.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
