import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiArrowLeft, HiVolumeUp, HiVolumeOff, HiPaperAirplane } from 'react-icons/hi';
import { MdOutlinePlace } from 'react-icons/md';
import { fetchObject, fetchByNfc, fetchByQr } from '../services/objectService';
import { askAI } from '../services/aiService';
export default function ObjectPage() {
    const { id, nfcId, qrCode } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [object, setObject] = useState(null);
    const [error, setError] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [asking, setAsking] = useState(false);
    const audioRef = useRef(null);
    useEffect(() => {
        (async () => {
            try {
                const obj = id ? await fetchObject(id)
                    : nfcId ? await fetchByNfc(nfcId)
                        : qrCode ? await fetchByQr(qrCode)
                            : null;
                if (!obj)
                    throw new Error();
                setObject(obj);
            }
            catch {
                setError(t('notFound'));
            }
        })();
    }, [id, nfcId, qrCode]);
    const toggleAudio = () => {
        if (!audioRef.current)
            return;
        playing ? audioRef.current.pause() : audioRef.current.play();
        setPlaying(p => !p);
    };
    const handleAsk = async () => {
        if (!question.trim() || !object)
            return;
        setAsking(true);
        setAnswer('');
        try {
            const res = await askAI(question, String(object.id));
            setAnswer(res);
        }
        catch {
            setAnswer('Sorry, could not get an answer. Please try again.');
        }
        setAsking(false);
    };
    if (error)
        return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center gap-4", children: [_jsx(MdOutlinePlace, { size: 40, className: "text-slate-300" }), _jsx("p", { className: "text-slate-500 text-sm", children: error }), _jsx("button", { onClick: () => navigate('/map'), className: "text-blue-500 text-sm underline", children: t('backToMap') })] }));
    if (!object)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50", children: _jsx("div", { className: "w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" }) }));
    return (_jsx("div", { className: "min-h-screen bg-slate-50", children: _jsxs("div", { className: "max-w-xl mx-auto px-4 py-6 space-y-4", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition", children: [_jsx(HiArrowLeft, { size: 16 }), " Back"] }), _jsx("div", { className: "w-full rounded-3xl overflow-hidden shadow-sm bg-white", children: object.imageUrl
                        ? _jsx("img", { src: object.imageUrl, alt: object.name, className: "w-full h-64 object-cover" })
                        : _jsx("div", { className: "w-full h-64 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center", children: _jsx(MdOutlinePlace, { size: 56, className: "text-slate-200" }) }) }), _jsxs("div", { className: "bg-white rounded-3xl shadow-sm px-6 py-5 space-y-3", children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-widest text-blue-400", children: object.type }), _jsx("h1", { className: "text-2xl font-bold text-slate-800 leading-snug", children: object.name }), _jsx("p", { className: "text-slate-500 text-sm leading-relaxed", children: object.description })] }), object.audioUrl && (_jsxs("div", { className: "bg-white rounded-3xl shadow-sm px-6 py-5", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3", children: "Audio Guide" }), _jsxs("button", { onClick: toggleAudio, className: `flex items-center gap-4 w-full px-5 py-4 rounded-2xl border transition active:scale-95 ${playing
                                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-100'
                                : 'bg-slate-50 border-slate-200 text-blue-500 hover:bg-blue-50'}`, children: [_jsx("div", { className: `w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${playing ? 'bg-white/20' : 'bg-blue-100'}`, children: playing ? _jsx(HiVolumeUp, { size: 20 }) : _jsx(HiVolumeOff, { size: 20 }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-sm font-semibold", children: playing ? t('pauseNarration') : t('listenNarration') }), _jsx("p", { className: `text-xs mt-0.5 ${playing ? 'text-blue-100' : 'text-slate-400'}`, children: playing ? 'Playing audio guide…' : 'Tap to hear the audio guide' })] })] }), _jsx("audio", { ref: audioRef, src: object.audioUrl, onEnded: () => setPlaying(false) })] })), _jsxs("div", { className: "bg-white rounded-3xl shadow-sm px-6 py-5 space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-slate-400", children: "Ask More" }), _jsxs("p", { className: "text-sm text-slate-500 mt-1", children: ["Have a question about ", _jsx("span", { className: "font-medium text-slate-700", children: object.name }), "? Ask our AI guide."] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-slate-50", placeholder: "e.g. How old is this tree?", value: question, onChange: e => setQuestion(e.target.value), onKeyDown: e => e.key === 'Enter' && handleAsk() }), _jsx("button", { onClick: handleAsk, disabled: asking || !question.trim(), className: "w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition", children: _jsx(HiPaperAirplane, { size: 15, className: "rotate-90" }) })] }), asking && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-400", children: [_jsx("div", { className: "w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" }), "Thinking\u2026"] })), answer && (_jsx("div", { className: "bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-600 leading-relaxed", children: answer }))] })] }) }));
}
