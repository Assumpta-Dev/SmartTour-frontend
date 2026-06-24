import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineAdjustments } from 'react-icons/hi';
import { fetchItems, fetchCategories, type Item, type Category } from '../services/tourismService';
import TripCard from '../components/ui/TripCard';

export default function AllItemsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchItems({ limit: 200 }),
      fetchCategories(),
    ]).then(([res, cats]) => {
      setItems(res.data ?? []);
      setCategories(cats);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  const filtered = activeSlug ? items.filter(i => i.category.slug === activeSlug) : items;

  if (!ready) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-12">
        <div className="space-y-4">
          <span className="text-accent font-headings font-bold text-sm uppercase tracking-widest">Discover Rwanda</span>
          <h1 className="text-5xl md:text-6xl font-headings font-extrabold text-slate-900 tracking-tighter">
            All Attractions
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSlug('')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeSlug === '' ? 'bg-primary text-slate-900 shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveSlug(cat.slug)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeSlug === cat.slug ? 'bg-primary text-slate-900 shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map(item => (
          <TripCard
            key={item.id}
            name={item.name}
            description={item.description}
            image={item.media[0]?.url}
            location={item.location.name}
            rating={item.rating || undefined}
            onClick={() => navigate(`/items/${item.slug}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-32 text-center space-y-4">
           <HiOutlineAdjustments size={48} className="mx-auto text-gray-200" />
           <p className="text-gray-400 font-headings font-bold text-xl">No attractions found in this category</p>
        </div>
      )}
    </div>
  );
}
