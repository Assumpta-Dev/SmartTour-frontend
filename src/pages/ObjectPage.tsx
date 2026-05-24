import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiArrowLeft, HiVolumeUp, HiVolumeOff, HiPaperAirplane } from 'react-icons/hi';
import { MdOutlinePlace } from 'react-icons/md';
import { fetchObject, fetchByNfc, fetchByQr, type TourObject } from '../services/objectService';
import { askAI } from '../services/aiService';

export default function ObjectPage() {
  const { id, nfcId, qrCode } = useParams<{ id?: string; nfcId?: string; qrCode?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [object, setObject]     = useState<TourObject | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [playing, setPlaying]   = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer]     = useState('');
  const [asking, setAsking]     = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const obj = id    ? await fetchObject(id)
                 : nfcId  ? await fetchByNfc(nfcId)
                 : qrCode ? await fetchByQr(qrCode)
                 : null;
        if (!obj) throw new Error();
        setObject(obj);
      } catch { setError(t('notFound')); }
    })();
  }, [id, nfcId, qrCode]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(p => !p);
  };

  const handleAsk = async () => {
    if (!question.trim() || !object) return;
    setAsking(true);
    setAnswer('');
    try {
      const res = await askAI(question, String(object.id));
      setAnswer(res);
    } catch { setAnswer('Sorry, could not get an answer. Please try again.'); }
    setAsking(false);
  };

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center gap-4">
      <MdOutlinePlace size={40} className="text-slate-300" />
      <p className="text-slate-500 text-sm">{error}</p>
      <button onClick={() => navigate('/map')} className="text-blue-500 text-sm underline">{t('backToMap')}</button>
    </div>
  );

  if (!object) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
          <HiArrowLeft size={16} /> Back
        </button>

        {/* Image card */}
        <div className="w-full rounded-3xl overflow-hidden shadow-sm bg-white">
          {object.imageUrl
            ? <img src={object.imageUrl} alt={object.name} className="w-full h-64 object-cover" />
            : <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                <MdOutlinePlace size={56} className="text-slate-200" />
              </div>
          }
        </div>

        {/* Main info card */}
        <div className="bg-white rounded-3xl shadow-sm px-6 py-5 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">{object.type}</span>
          <h1 className="text-2xl font-bold text-slate-800 leading-snug">{object.name}</h1>
          <p className="text-slate-500 text-sm leading-relaxed">{object.description}</p>
        </div>

        {/* Narration card */}
        {object.audioUrl && (
          <div className="bg-white rounded-3xl shadow-sm px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Audio Guide</p>
            <button onClick={toggleAudio}
              className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl border transition active:scale-95 ${
                playing
                  ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-100'
                  : 'bg-slate-50 border-slate-200 text-blue-500 hover:bg-blue-50'
              }`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${playing ? 'bg-white/20' : 'bg-blue-100'}`}>
                {playing ? <HiVolumeUp size={20} /> : <HiVolumeOff size={20} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{playing ? t('pauseNarration') : t('listenNarration')}</p>
                <p className={`text-xs mt-0.5 ${playing ? 'text-blue-100' : 'text-slate-400'}`}>
                  {playing ? 'Playing audio guide…' : 'Tap to hear the audio guide'}
                </p>
              </div>
            </button>
            <audio ref={audioRef} src={object.audioUrl} onEnded={() => setPlaying(false)} />
          </div>
        )}

        {/* Ask More card */}
        <div className="bg-white rounded-3xl shadow-sm px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Ask More</p>
            <p className="text-sm text-slate-500 mt-1">Have a question about <span className="font-medium text-slate-700">{object.name}</span>? Ask our AI guide.</p>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-slate-50"
              placeholder="e.g. How old is this tree?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
            />
            <button onClick={handleAsk} disabled={asking || !question.trim()}
              className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition">
              <HiPaperAirplane size={15} className="rotate-90" />
            </button>
          </div>
          {asking && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Thinking…
            </div>
          )}
          {answer && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-600 leading-relaxed">
              {answer}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
