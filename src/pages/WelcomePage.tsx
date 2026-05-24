import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineCog } from 'react-icons/hi';
import LanguageSelector from '../components/common/LanguageSelector';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleStart = () => {
    navigator.geolocation.getCurrentPosition(
      () => navigate('/map'),
      () => navigate('/map'),
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/wildlife1.jpg')" }}
    >
      {/* Gradient overlay — darker at bottom for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

      <div className="relative flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex justify-between items-center px-8 pt-8">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/50">
            Smart Tourism
          </span>
          <button onClick={() => navigate('/admin')} className="text-white/40 hover:text-white transition">
            <HiOutlineCog size={22} />
          </button>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">

          <div className="space-y-4 max-w-lg">
            <p className="text-4xl font-bold tracking-widest uppercase text-blue-400">Welcome</p>
            <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
              Your Smart Digital Tour Guide
            </h1>
            <p className="text-white/75 text-sm leading-relaxed">
              Discover nature, wildlife, and history through interactive guidance.
              Tap or scan objects around you to learn more. Use GPS Guidance to
              navigate to different places around you.
            </p>
          </div>

          <LanguageSelector />

          <button
            onClick={handleStart}
            className="px-10 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl text-base font-bold shadow-2xl shadow-blue-900/40 transition-all active:scale-95"
          >
            {t('startTour')}
          </button>
        </div>

        <p className="relative text-center text-xs text-white/40 pb-6">No sign-up required</p>
      </div>
    </div>
  );
}
