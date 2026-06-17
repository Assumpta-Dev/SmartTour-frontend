import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { fetchItems, fetchCategories, type Item, type Category } from '../services/tourismService';

const PAGE_SIZE = 8;

export default function AllItemsPage() {
  const navigate = useNavigate();
  const [items, setItems]           = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeSlug, setActiveSlug] = useState('');
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);

  useEffect(() => {
    Promise.all([
      fetchItems({ limit: 200 }),
      fetchCategories(),
    ]).then(([res, cats]) => {
      setItems(res.data ?? []);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = activeSlug ? items.filter(i => i.category.slug === activeSlug) : items;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (slug: string) => { setActiveSlug(slug); setPage(1); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition mb-6">
          <HiArrowLeft size={16} /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-800 mb-4">All Attractions</h1>

        {/* Category filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 pr-4 scroll-smooth touch-pan-x select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4">
          <button onClick={() => handleFilter('')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              activeSlug === '' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}>All</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => handleFilter(cat.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition border whitespace-nowrap ${
                activeSlug === cat.slug ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}>
              {cat.name}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-4">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</p>

        {filtered.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-16">No items found.</p>
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
                    <p className="text-xs text-slate-400 mt-0.5">{item.category.name} · {item.location.name}</p>
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
