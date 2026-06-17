import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiChevronRight, HiChevronLeft } from 'react-icons/hi';
import { MdPets, MdPark, MdAccountBalance, MdRestaurant, MdHotel, MdDirectionsWalk, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage, GiCampingTent } from 'react-icons/gi';
import { TbLeaf } from 'react-icons/tb';
import { fetchLocation, fetchCategories, fetchItems, type Location, type Category, type Item } from '../services/tourismService';
import { Footer } from './HomePage';

const CAT_ICON: Record<string, JSX.Element> = {
  animals:     <MdPets size={18} />,
  birds:       <GiBirdCage size={18} />,
  forests:     <MdPark size={18} />,
  plants:      <TbLeaf size={18} />,
  camping:     <GiCampingTent size={18} />,
  hotels:      <MdHotel size={18} />,
  restaurants: <MdRestaurant size={18} />,
  activities:  <MdDirectionsWalk size={18} />,
  attractions: <MdAccountBalance size={18} />,
};

export default function LocationPage() {
  const { slug }   = useParams<{ slug: string }>();
  const navigate   = useNavigate();
  const [location,   setLocation]   = useState<Location | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items,      setItems]      = useState<Item[]>([]);
  const [activeCat,  setActiveCat]  = useState<number | null>(null);
  const [error,      setError]      = useState(false);
  const [page,       setPage]       = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    if (!slug) return;
    fetchLocation(slug).then(setLocation).catch(() => setError(true));
    fetchCategories().then(setCategories).catch(() => null);
  }, [slug]);

  useEffect(() => {
    if (!location) return;
    fetchItems({ locationId: location.id, categoryId: activeCat ?? undefined, limit: 200 })
      .then(r => { setItems(r.data); setPage(1); }).catch(() => null);
  }, [location, activeCat]);

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <MdOutlinePlace size={48} className="text-blue-100" />
      <p className="text-slate-500">Location not found.</p>
      <button onClick={() => navigate('/')} className="text-blue-500 text-sm underline">Back to home</button>
    </div>
  );

  if (!location) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* Sticky nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-50 px-5 py-3.5 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-2xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 transition flex-shrink-0">
          <HiArrowLeft size={18} />
        </button>
        <span className="font-bold text-slate-800 truncate">{location.name}</span>
      </div>

      {/* Cover image */}
      <div className="pt-[60px]">
        {location.coverImage
          ? <div className="relative h-64 overflow-hidden">
              <img src={location.coverImage} alt={location.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-5 left-6">
                <h1 className="text-white text-2xl font-bold">{location.name}</h1>
              </div>
            </div>
          : <div className="h-48 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
              <MdPark size={56} className="text-blue-200" />
            </div>
        }
      </div>

      <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">

        {/* Description */}
        <div className="bg-blue-50 rounded-3xl px-6 py-5">
          <h2 className="text-lg font-bold text-slate-800 mb-2">{location.name}</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{location.description}</p>
        </div>

        {/* Overview video */}
        {location.videoUrl && (
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-3">Overview Video</h3>
            <video
              src={location.videoUrl}
              controls
              className="w-full rounded-3xl shadow-sm border border-slate-100"
              poster={location.coverImage ?? undefined}
            />
          </div>
        )}

        {/* Category filters */}
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-4">Explore Features</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCat(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                activeCat === null ? 'bg-blue-500 text-white shadow-sm shadow-blue-200' : 'bg-blue-50 text-slate-600 hover:bg-blue-100'
              }`}
            >All</button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id === activeCat ? null : cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                  activeCat === cat.id ? 'bg-blue-500 text-white shadow-sm shadow-blue-200' : 'bg-blue-50 text-slate-600 hover:bg-blue-100'
                }`}
              >
                <span className={activeCat === cat.id ? 'text-white' : 'text-blue-500'}>
                  {CAT_ICON[cat.slug] ?? <MdAccountBalance size={18} />}
                </span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items grid */}
        {(() => {
          const totalPages = Math.ceil(items.length / PAGE_SIZE);
          const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
          return (
            <div className="pb-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {paged.map(item => (
                  <motion.button
                    key={item.id}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    onClick={() => navigate(`/items/${item.slug}`)}
                    className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm text-left group"
                  >
                    {item.media[0]
                      ? <img src={item.media[0].url} alt={item.name} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-28 bg-blue-50 flex items-center justify-center text-blue-300">
                          {CAT_ICON[item.category.slug] ?? <MdOutlinePlace size={28} />}
                        </div>
                    }
                    <div className="p-3">
                      <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400 capitalize mt-0.5">{item.category.name}</p>
                      <p className="flex items-center gap-0.5 text-xs text-blue-500 mt-1.5 font-medium">View <HiChevronRight size={12} /></p>
                    </div>
                  </motion.button>
                ))}
                {items.length === 0 && (
                  <div className="col-span-2 sm:col-span-3 text-center py-12 text-slate-400 text-sm">
                    No features added yet for this destination.
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:border-blue-300 transition">
                    <HiChevronLeft size={16} className="text-slate-600" />
                  </button>
                  <span className="text-sm text-slate-500">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:border-blue-300 transition">
                    <HiChevronRight size={16} className="text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <Footer />
    </div>
  );
}
