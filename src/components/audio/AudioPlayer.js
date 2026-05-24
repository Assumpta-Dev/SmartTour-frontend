import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { HiPlay, HiPause } from 'react-icons/hi';
export default function AudioPlayer({ audioUrl }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const toggle = () => {
        if (!audioRef.current)
            return;
        playing ? audioRef.current.pause() : audioRef.current.play();
        setPlaying(!playing);
    };
    return (_jsxs("div", { className: "flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3", children: [_jsx("button", { onClick: toggle, className: "w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-200 hover:bg-blue-400 transition active:scale-95", children: playing ? _jsx(HiPause, { size: 20 }) : _jsx(HiPlay, { size: 20, className: "ml-0.5" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-slate-700", children: playing ? 'Playing narration…' : 'Audio narration' }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Tap to ", playing ? 'pause' : 'listen'] })] }), _jsx("audio", { ref: audioRef, src: audioUrl, onEnded: () => setPlaying(false) })] }));
}
