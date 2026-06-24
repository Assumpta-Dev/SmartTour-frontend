import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories, fetchItems, type Category, type Item } from '../services/tourismService';
import TripCard from '../components/ui/TripCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setReady(false);
    Promise.all([
      fetchCategories(),
      fetchItems({ limit: 200 }),
    ]).then(([cats, itemsRes]) => {
      const cat = cats.find(c => c.slug === slug) ?? null;
      setCategory(cat);
      if (cat) setItems((itemsRes.data ?? []).filter((i: Item) => i.category.slug === slug));
      setReady(true);
    }).catch(() => {
      setReady(true);
      navigate('/');
    });
  }, [slug, navigate]);

  if (!ready || !category) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 space-y-16">
      <div className="space-y-4 border-b border-gray-100 pb-12">
        <span className="text-accent font-headings font-bold text-sm uppercase tracking-widest">Category</span>
        <h1 className="text-5xl md:text-6xl font-headings font-extrabold text-slate-900 tracking-tighter capitalize">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-500 text-lg max-w-2xl">{category.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map(item => (
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

      {items.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-gray-400 font-headings font-bold text-xl uppercase tracking-widest">No items in this category yet</p>
        </div>
      )}
    </div>
  );
}
