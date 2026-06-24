import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiLeafLine } from 'react-icons/ri';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Home',         path: '/' },
  { label: 'Destinations', path: '/#destinations' },
  { label: 'Tours',        path: '/items' },
  { label: 'GPS Explorer', path: '/gps' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname + location.hash);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!location.hash) setActivePath(location.pathname);
  }, [location.pathname]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleNav = (path: string) => {
    setMenuOpen(false);
    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      setActivePath(path);
      if (location.pathname !== (route || '/')) {
        navigate(route || '/');
        setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 300);
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setActivePath(path);
      navigate(path);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-white border-b border-gray-100 h-16 px-6 lg:px-10 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActivePath('/'); navigate('/'); }}>
          <RiLeafLine size={24} className="text-primary" />
          <span className="font-headings font-extrabold text-slate-900 text-2xl tracking-tighter">
            Smart<span className="text-primary">Tour</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = activePath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`relative px-1 py-2 text-sm font-bold tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-slate-900' : 'text-slate-900 hover:text-primary'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-1.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm"
          >
            Admin
          </button>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-primary transition-colors text-slate-900"
          >
            {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden bg-white border-b border-gray-100 shadow-lg px-6 py-4 flex flex-col gap-1"
          >
            {NAV_LINKS.map(link => {
              const isActive = activePath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                    isActive ? 'text-slate-900' : 'text-slate-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavMobile"
                      className="absolute bottom-0 left-4 right-4 h-1.5 bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => { setMenuOpen(false); navigate('/admin'); }}
              className="mt-2 w-full bg-slate-900 hover:bg-black text-white px-4 py-3 rounded-xl text-sm font-bold transition"
            >
              Admin
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
