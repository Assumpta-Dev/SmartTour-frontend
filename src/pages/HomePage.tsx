import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import {
  MdPets, MdPark, MdAccountBalance, MdRestaurant,
  MdHotel, MdDirectionsWalk,
} from 'react-icons/md';
import { GiBirdCage, GiCampingTent } from 'react-icons/gi';
import { TbLeaf, TbWaterpolo } from 'react-icons/tb';
import Hero from '../components/ui/Hero';
import TripCard from '../components/ui/TripCard';
import {
  fetchLocations, fetchCategories, fetchItems,
  type Location, type Category, type Item,
} from '../services/tourismService';

const CAT_ICON: Record<string, JSX.Element> = {
  animals:     <MdPets />,
  birds:       <GiBirdCage />,
  trees:       <MdPark />,
  plants:      <TbLeaf />,
  camping:     <GiCampingTent />,
  hotels:      <MdHotel />,
  restaurants: <MdRestaurant />,
  activities:  <MdDirectionsWalk />,
  attractions: <MdAccountBalance />,
  waterfalls:  <TbWaterpolo />,
};

const CTA_TEXTS = [
  {
    heading: <>Welcome to <strong>Smart Tour</strong> Rwanda</>,
    sub: 'Discover the land of a thousand hills — wildlife, culture, adventure and nature at your fingertips.',
  },
  {
    heading: <>Discover <strong>Rwanda</strong> Smarter</>,
    sub: 'NFC tags, QR codes, GPS maps and AI voice guides — all built for the modern explorer.',
  },
  {
    heading: <>Your Digital Guide <strong>to Rwanda</strong></>,
    sub: 'From Volcanoes Park to Nyungwe Forest, every attraction is one tap away.',
  },
];

function CtaBanner() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % CTA_TEXTS.length), 3500);
    return () => clearInterval(t);
  }, []);
  const current = CTA_TEXTS[idx];
  return (
    <section className="bg-white py-32 min-h-[420px] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 border-l-4 border-yellow-400 pl-8">
          <div className="h-36 flex items-start overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h2
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5 }}
                className="text-4xl lg:text-5xl font-headings text-slate-900 leading-tight"
              >
                {current.heading}
              </motion.h2>
            </AnimatePresence>
          </div>
          <div className="flex gap-2 mt-4">
            {CTA_TEXTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-yellow-400 w-6' : 'bg-gray-200 w-2.5'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-400 text-base leading-relaxed"
            >
              {current.sub}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [locations,     setLocations]     = useState<Location[]>([]);
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);

  useEffect(() => {
    Promise.all([
      fetchLocations().catch(() => []),
      fetchCategories().catch(() => []),
      fetchItems({ limit: 50 }).catch(() => ({ data: [] })),
    ]).then(([locs, cats, itemsRes]) => {
      setLocations(locs as Location[]);
      setCategories(cats as Category[]);
      setFeaturedItems((itemsRes as any).data ?? []);
    });
  }, []);

  const heroSlides = [
    ...featuredItems.slice(0, 3).filter(i => i.media[0]?.url).map(item => ({
      image:    item.media[0].url,
      title:    item.name.split(' ').slice(0, 2).join(' '),
      subtitle: `${item.location.name} · ${item.category.name}`,
    })),
    ...locations.filter(l => l.coverImage).slice(0, 2).map(loc => ({
      image:    loc.coverImage!,
      title:    loc.name,
      subtitle: 'Discover Your Paradise',
    })),
  ];

  return (
    <div className="space-y-24 pb-0">

      {/* HERO */}
      <Hero slides={heroSlides.length > 0 ? heroSlides : [{ image: '/park.jpg', title: 'Rwanda', subtitle: 'Discover Your Paradise' }]} />

      {/* DESTINATIONS */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-accent font-headings font-bold text-sm uppercase tracking-widest">Explore Rwanda</span>
            <h2 className="text-4xl md:text-5xl font-headings font-extrabold text-slate-900 tracking-tight">Popular Destinations</h2>
          </div>
          <button onClick={() => navigate('/locations')} className="flex items-center gap-2 text-slate-900 font-bold group">
            View All Destinations
            <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {locations.slice(0, 4).map(loc => (
            <TripCard
              key={loc.id}
              name={loc.name}
              description={loc.description}
              image={loc.coverImage ?? undefined}
              location={loc.name}
              duration={`${loc._count?.items ?? 0} Features`}
              onClick={() => navigate(`/locations/${loc.slug}`)}
            />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-16 space-y-2">
              <span className="text-accent font-headings font-bold text-sm uppercase tracking-widest">Choose Your Style</span>
              <h2 className="text-4xl font-headings font-extrabold text-slate-900 tracking-tight">Explore by Category</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map(cat => (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl text-primary-dark group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                    {CAT_ICON[cat.slug] ?? <MdAccountBalance />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900">{cat.name}</h3>
                    {cat._count?.items != null && (
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{cat._count.items} Items</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED ATTRACTIONS */}
      {featuredItems.filter(i => i.featured).length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-accent font-headings font-bold text-sm uppercase tracking-widest">Don't Miss</span>
              <h2 className="text-4xl md:text-5xl font-headings font-extrabold text-slate-900 tracking-tight">Featured Attractions</h2>
            </div>
            <button onClick={() => navigate('/items')} className="flex items-center gap-2 text-slate-900 font-bold group">
              Discover More
              <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredItems.filter(i => i.featured).slice(0, 8).map(item => (
              <TripCard
                key={item.id}
                name={item.name}
                description={item.description}
                image={item.media[0]?.url}
                location={item.location.name}
                rating={item.rating || undefined}
                slug={item.slug}
                onClick={() => navigate(`/items/${item.slug}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ANIMATED CTA BANNER — above footer */}
      <CtaBanner />

    </div>
  );
}
