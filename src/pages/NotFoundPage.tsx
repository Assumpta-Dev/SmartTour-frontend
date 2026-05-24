import { useNavigate } from 'react-router-dom';
import { HiOutlineLocationMarker } from 'react-icons/hi';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <HiOutlineLocationMarker size={30} className="text-slate-300" />
      </div>
      <p className="text-slate-800 font-semibold">Page not found</p>
      <p className="text-slate-400 text-sm">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate('/')} className="text-blue-500 text-sm underline">Go home</button>
    </div>
  );
}
