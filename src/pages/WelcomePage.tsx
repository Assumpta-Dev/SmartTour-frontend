import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineMap, HiOutlineCog } from 'react-icons/hi';
import { MdNfc, MdQrCodeScanner } from 'react-icons/md';
import LanguageSelector from '../components/common/LanguageSelector';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleStart = () => navigate('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Top bar */}
      <div className="flex justify-between items-center px-6 pt-6">
        <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 opacity-70">Smart Tourism</span>
        <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-slate-600 transition">
          <HiOutlineCog size={20} />
        </button>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-2">
          <HiOutlineMap size={40} className="text-blue-500" />
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-slate-800">{t('welcome')}</h1>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Tap an NFC tag or scan a QR code to discover attractions around you.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex gap-3 flex-wrap justify-center">
          {[
            { icon: <MdNfc size={16} />, label: 'NFC Tap' },
            { icon: <MdQrCodeScanner size={16} />, label: 'QR Scan' },
          ].map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full text-blue-500">
              {icon} {label}
            </span>
          ))}
        </div>

        <LanguageSelector />

        <button
          onClick={handleStart}
          className="mt-2 px-10 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl text-base font-semibold shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          {t('startTour')}
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 pb-6">No sign-up required</p>
    </div>
  );
}
