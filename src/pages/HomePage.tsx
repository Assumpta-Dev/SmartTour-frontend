import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import {
  HiOutlineCog, HiChevronRight, HiPhone, HiMail,
  HiLocationMarker, HiStar,
} from 'react-icons/hi';
import {
  MdPets, MdPark, MdAccountBalance, MdRestaurant,
  MdHotel, MdDirectionsWalk, MdNfc, MdQrCodeScanner,
  MdGpsFixed, MdPhotoCamera,
} from 'react-icons/md';
import { GiBirdCage, GiCampingTent } from 'react-icons/gi';
import { TbLeaf, TbWaterpolo } from 'react-icons/tb';
import { RiLeafLine } from 'react-icons/ri';
import {
  fetchLocations, fetchCategories, fetchItems,
  type Location, type Category, type Item,
} from '../services/tourismService';

/* ── helpers ── */
const CAT_ICON: Record<string, JSX.Element> = {
  animals:     <MdPets size={16} />,
  birds:       <GiBirdCage size={16} />,
  trees:       <MdPark size={16} />,
  plants:      <TbLeaf size={16} />,
  camping:     <GiCampingTent size={16} />,
  hotels:      <MdHotel size={16} />,
  restaurants: <MdRestaurant size={16} />,
  activities:  <MdDirectionsWalk size={16} />,
  attractions: <MdAccountBalance size={16} />,
  waterfalls:  <TbWaterpolo size={16} />,
};

/* ── Footer ── */
function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <p className="text-lg font-bold tracking-tight mb-3">Smart Tourism</p>
          <p className="text-blue-100 text-sm leading-relaxed">
            Discover the land of a thousand hills — wildlife, culture, adventure and nature.
          </p>
          <div className="flex gap-2 mt-4">
            <span className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
              <MdNfc size={13} /> NFC Tap
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
              <MdQrCodeScanner size={13} /> QR Scan
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-3">Explore</p>
          <ul className="space-y-2 text-sm text-blue-100">
            {[
              { label: 'Home',           path: '/' },
              { label: 'GPS Explorer',   path: '/gps' },
              { label: 'Volcanoes Park', path: '/locations/volcanoes' },
              { label: 'Akagera Park',   path: '/locations/akagera' },
              { label: 'Nyungwe Forest', path: '/locations/nyungwe' },
            ].map(l => (
              <li key={l.path}>
                <button onClick={() => navigate(l.path)} className="hover:text-white transition">{l.label}</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-3">Contact</p>
          <ul className="space-y-2.5 text-sm text-blue-100">
            <li className="flex items-center gap-2"><HiLocationMarker size={14} className="flex-shrink-0" /> Kigali, Rwanda</li>
            <li className="flex items-center gap-2"><HiPhone size={14} className="flex-shrink-0" /> +250 700 000 000</li>
            <li className="flex items-center gap-2"><HiMail size={14} className="flex-shrink-0" /> info@tourism.rw</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-500 px-8 py-4 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} Smart Tourism Guide · Powered by <span className="text-white font-semibold">Icumu Tech Ltd</span>
      </div>
    </footer>
  );
}
export { Footer };

/* ══════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const [locations,  setLocations]  = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load locations + categories first — renders the page shell instantly
    Promise.all([
      fetchLocations().catch(() => []),
      fetchCategories().catch(() => []),
    ]).then(([locs, cats]) => {
      setLocations(locs as Location[]);
      setCategories(cats as Category[]);
      setReady(true);
    });

    // Load items separately — slides + featured strip appear shortly after
    fetchItems({ limit: 50 }).catch(() => ({ data: [] })).then((itemsRes: any) => {
      const items = itemsRes.data ?? [];
      setAllItems(items);
      setFeaturedItems(items.filter((i: Item) => i.media.length > 0 || i.featured));
    });
  }, []);

  // Compute item counts per location from actual fetched items
  const locationItemCount = (locId: number) =>
    allItems.filter(i => i.location.id === locId).length;

  // Build slides from items WITH media + location covers — always enough to loop
  const itemSlides: { image: string; title: string; sub: string; slug: string; catSlug: string }[] =
    featuredItems
      .filter(i => i.media[0]?.url)
      .map(i => ({
        image:   i.media[0].url,
        title:   i.name,
        sub:     `${i.location.name} · ${i.category.name}`,
        slug:    i.slug,
        catSlug: i.category.slug,
      }));

  const locSlides: { image: string; title: string; sub: string; slug: string; catSlug: string }[] =
    locations
      .filter(l => l.coverImage)
      .map(l => ({
        image:   l.coverImage!,
        title:   l.name,
        sub:     'Explore this destination',
        slug:    l.slug,
        catSlug: '',
      }));

  // Merge: items first, then fill with location covers not already represented
  const usedSlugs = new Set(itemSlides.map(s => s.slug));
  const slides = [
    ...itemSlides,
    ...locSlides.filter(s => !usedSlugs.has(s.slug)),
  ];

  const gridLocations = locations.slice(0, 8);

  // Show loading screen until all data is ready
  if (!ready) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-blue-500 font-semibold text-sm tracking-wide">Smart Tourism</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-6 lg:px-10 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <RiLeafLine size={22} className="text-blue-500" />
          <span className="font-extrabold text-slate-800 text-base tracking-tight">Smart Tourism</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition rounded-lg hover:bg-blue-50">
            Home
          </button>
          <button
            onClick={() => navigate('/gps')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition rounded-lg hover:bg-blue-50">
            <MdGpsFixed size={15} /> GPS
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 ml-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm shadow-blue-200">
            <HiOutlineCog size={15} /> Admin
          </button>
        </div>
      </nav>

      {/* ── Main content below nav ── */}
      <div className="pt-14">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">

          {/* ══ Hero row: big card left + location grid right ══ */}
          <div className="flex gap-5 h-[520px]">

            {/* ── BIG FEATURED SWIPER CARD (left) ── */}
            <div className="flex-1 min-w-0 rounded-2xl overflow-hidden shadow-md relative group">
              {slides.length > 0 ? (
                <Swiper
                  modules={[Autoplay]}
                  autoplay={{ delay: 3500, disableOnInteraction: false }}
                  speed={600}
                  loop={true}
                  slidesPerView={1}
                  className="hero-swiper"
                >
                  {slides.map((s, i) => (
                    <SwiperSlide
                      key={i}
                      onClick={() => navigate(s.catSlug ? `/items/${s.slug}` : `/locations/${s.slug}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={s.image}
                        alt={s.title}
                        style={{
                          position: 'absolute', inset: 0,
                          width: '100%', height: '100%',
                          objectFit: 'cover', display: 'block',
                          imageRendering: 'auto',
                          filter: 'none',
                        }}
                      />
                      {/* minimal gradient only directly behind text */}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                        pointerEvents: 'none',
                      }} />
                      {s.catSlug && CAT_ICON[s.catSlug] && (
                        <div
                          style={{ position: 'absolute', top: 16, left: 16, pointerEvents: 'none' }}
                          className="flex items-center gap-1.5 bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow"
                        >
                          {CAT_ICON[s.catSlug]}
                          <span className="capitalize">{s.catSlug}</span>
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', pointerEvents: 'none' }}>
                        <p className="text-white/90 text-sm font-medium mb-1">{s.sub}</p>
                        <h2 className="text-white text-2xl font-bold drop-shadow-lg">{s.title}</h2>
                        <div className="mt-3 inline-flex items-center gap-2 bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow">
                          Explore <HiChevronRight size={13} />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center gap-3 text-blue-200">
                  <MdPhotoCamera size={48} />
                  <p className="text-sm text-slate-400">Loading featured content…</p>
                </div>
              )}
            </div>

            {/* ── LOCATION GRID (right) ── */}
            <div className="w-[360px] flex-shrink-0 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-base font-bold text-slate-800">Destinations</p>
                <button
                  onClick={() => navigate('/')}
                  className="text-xs text-blue-500 font-semibold hover:underline flex items-center gap-0.5">
                  See all <HiChevronRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 flex-1 content-start overflow-y-auto pr-1 custom-scroll">
                {(gridLocations.length > 0 ? gridLocations : Array.from({ length: 4 }, (_, i) => ({ id: i, name: '—', slug: '', coverImage: null, _count: { items: 0 } } as unknown as Location))).map(loc => (
                  <motion.button
                    key={loc.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => loc.slug && navigate(`/locations/${loc.slug}`)}
                    className="relative rounded-xl overflow-hidden h-[116px] text-left shadow-sm border border-slate-100 group"
                  >
                    {loc.coverImage ? (
                      <img
                        src={loc.coverImage}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                        <MdPark size={28} className="text-blue-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-bold leading-tight line-clamp-1">{loc.name}</p>
                      <p className="text-white/60 text-[10px] mt-0.5">{locationItemCount(loc.id)} Features</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* ══ Categories row ══ */}
          {categories.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-bold text-slate-800">Browse by Category</p>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map(cat => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(`/locations`)}
                    className="flex-shrink-0 flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl px-4 py-2.5 transition shadow-sm"
                  >
                    <span className="text-blue-500">{CAT_ICON[cat.slug] ?? <MdAccountBalance size={16} />}</span>
                    <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">{cat.name}</span>
                    {cat._count?.items != null && cat._count.items > 0 && (
                      <span className="text-[10px] text-blue-400 font-bold bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                        {cat._count.items}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* ══ Featured Items strip ══ */}
          {featuredItems.filter(i => i.featured).length > 0 && (
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-bold text-slate-800">Featured Attractions</p>
                <button
                  onClick={() => navigate('/locations')}
                  className="text-xs text-blue-500 font-semibold hover:underline flex items-center gap-0.5">
                  View all <HiChevronRight size={12} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {featuredItems.filter(i => i.featured).map(item => (
                  <motion.button
                    key={item.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 350 }}
                    onClick={() => navigate(`/items/${item.slug}`)}
                    className="flex-shrink-0 w-44 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm text-left group"
                  >
                    {item.media[0] ? (
                      <img src={item.media[0].url} alt={item.name} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-28 bg-blue-50 flex items-center justify-center text-blue-200">
                        {CAT_ICON[item.category.slug] ?? <MdAccountBalance size={28} />}
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{item.category.name}</p>
                      {item.rating > 0 && (
                        <p className="flex items-center gap-0.5 text-[10px] text-blue-500 font-semibold mt-1">
                          <HiStar size={11} className="text-amber-400" /> {item.rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
