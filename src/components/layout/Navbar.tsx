import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiLeafLine } from 'react-icons/ri';
import { motion } from 'framer-motion';

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

  // Sync activePath on route changes (back/forward), but not for same-page hash scrolls
  useEffect(() => {
    const full = location.pathname + (location.hash || '');
    // Only sync if it's a real route change, not a hash-scroll we triggered
    if (!location.hash) setActivePath(location.pathname);
  }, [location.pathname]);

  const handleNav = (path: string) => {
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
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActivePath('/'); navigate('/'); }}>
          <RiLeafLine size={24} className="text-primary" />
          <span className="font-headings font-extrabold text-slate-900 text-2xl tracking-tighter">
            Smart<span className="text-primary">Tour</span>
          </span>
        </div>

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

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold transition shadow-sm"
          >
            Admin
          </button>
        </div>
      </div>
    </nav>
  );
}
