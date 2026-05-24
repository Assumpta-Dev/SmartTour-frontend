import { useRef, useState } from 'react';
import { HiPlay, HiPause } from 'react-icons/hi';

export default function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3">
      <button
        onClick={toggle}
        className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-200 hover:bg-blue-400 transition active:scale-95"
      >
        {playing ? <HiPause size={20} /> : <HiPlay size={20} className="ml-0.5" />}
      </button>
      <div>
        <p className="text-sm font-medium text-slate-700">{playing ? 'Playing narration…' : 'Audio narration'}</p>
        <p className="text-xs text-slate-400">Tap to {playing ? 'pause' : 'listen'}</p>
      </div>
      <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
    </div>
  );
}
