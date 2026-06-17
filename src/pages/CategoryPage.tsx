import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { fetchCategories, fetchItems, type Category, type Item } from '../services/tourismService';

const PAGE_SIZE = 8;

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetchCategories(),
      fetchItems({ limit: 200 }),
    ]).then(([cats, itemsRes]) => {
      const cat = cats.find(c => c.slug === slug) ?? null;
      setCategory(cat);
      if (cat) setItems((itemsRes.data ?? []).filter((i: Item) => i.category.slug === slug));
    }).finally(() => setLoading(false));
  }, [slug]);

  // reset page when slug changes
  useEffect(() => { setPage(1); }, [slug]);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!category) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <p className="text-slate-500 text-sm">Category not found.</p>
      <button onClick={() => navigate('/')} className="text-blue-500 text-sm underline">Back to Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition mb-6">
          <HiArrowLeft size={16} /> Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">{category.name}</h1>
          {category.description && <p className="text-slate-500 text-sm mt-1">{category.description}</p>}
          <p className="text-xs text-slate-400 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>

        {items.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-16">No items in this category yet.</p>
        ) : (
          <>
            <div className="space-y-3">
              {paged.map(item => (
                <button key={item.id} onClick={() => navigate(`/items/${item.slug}`)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition text-left">
                  {item.media[0]
                    ? <img src={item.media[0].url} alt={item.name} className="w-20 h-20 object-cover flex-shrink-0" />
                    : <div className="w-20 h-20 bg-blue-50 flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0 py-3 pr-3">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{item.location.name}</p>
                    {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>}
                  </div>
                  <HiChevronRight size={16} className="text-slate-300 flex-shrink-0 mr-3" />
                </button>
              ))}
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
          </>
        )}
      </div>
    </div>
  );
}
