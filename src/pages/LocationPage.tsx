import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLocationMarker } from 'react-icons/hi';
import { MdAccountBalance } from 'react-icons/md';

import TripCard from '../components/ui/TripCard';
import { fetchLocation, fetchCategories, fetchItems, type Location, type Category, type Item } from '../services/tourismService';

export default function LocationPage() {
  const { slug }  = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      try {
        const loc = await fetchLocation(slug);
        const cats = await fetchCategories().catch(() => []);
        setLocation(loc);
        setCategories(cats as Category[]);
        setReady(true);
      } catch (err) {
        navigate('/');
      }
    };
    load();
  }, [slug, navigate]);

  useEffect(() => {
    if (!location) return;
    fetchItems({ locationId: location.id, categoryId: activeCat ?? undefined, limit: 100 })
      .then(r => setItems(r.data)).catch(() => null);
  }, [location, activeCat]);

  if (!ready || !location) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 font-bold text-xs tracking-widest uppercase">Finding Destination...</p>
    </div>
  );

  return (
    <div className="space-y-16 pb-24">
      {/* ── HERO ── */}
      <div className="relative h-[450px] w-full overflow-hidden">
        <img 
          src={location.coverImage || 'https://picsum.photos/1920/1080?nature'} 
          alt={location.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6">
           <motion.span 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-primary font-headings font-bold text-sm uppercase tracking-widest mb-4"
           >
             Rwanda Destination
           </motion.span>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-6xl md:text-8xl font-headings font-extrabold tracking-tighter text-center"
           >
             {location.name}
           </motion.h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-primary" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-24">
        {/* ── INFO ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-headings font-extrabold text-slate-900">About {location.name}</h2>
            <p className="text-gray-500 text-lg leading-relaxed">{location.description}</p>
            {location.videoUrl && (
              <div className="rounded-[32px] overflow-hidden shadow-modern border border-gray-100">
                <video src={location.videoUrl} controls className="w-full" poster={location.coverImage ?? undefined} />
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 space-y-8 sticky top-32">
             <div className="space-y-4">
               <h3 className="font-headings font-extrabold text-xl">Quick Details</h3>
               <div className="space-y-3">
                 <div className="flex items-center gap-3 text-gray-600">
                   <HiLocationMarker className="text-primary-dark" />
                   <span>Rwanda, East Africa</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-600">
                   <MdAccountBalance className="text-primary-dark" />
                <span>{items.length} Attractions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* ── FEATURES GRID ── */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
            <h3 className="text-3xl font-headings font-extrabold text-slate-900 tracking-tight">Explore Features</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setActiveCat(null)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeCat === null ? 'bg-primary text-slate-900 shadow-md' : 'text-gray-400 hover:text-slate-600 hover:bg-gray-100'
                }`}
              >All Features</button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeCat === cat.id ? 'bg-primary text-slate-900 shadow-md' : 'text-gray-400 hover:text-slate-600 hover:bg-gray-100'
                  }`}
                >{cat.name}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map(item => (
              <TripCard
                key={item.id}
                name={item.name}
                description={item.description}
                image={item.media[0]?.url}
                location={location.name}
                rating={item.rating || undefined}
                onClick={() => navigate(`/items/${item.slug}`)}
              />
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-24 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                No features found for this category
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
