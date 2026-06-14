import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiArrowLeft, HiLocationMarker, HiVolumeUp, HiVolumeOff, HiLightBulb, HiChevronRight, } from 'react-icons/hi';
import { MdPets, MdPark, MdAccountBalance, MdOutlinePlace } from 'react-icons/md';
import { GiBirdCage } from 'react-icons/gi';
import LanguageSelector from '../components/common/LanguageSelector';
import { fetchObject, fetchByNfc, fetchByQr, fetchNearby } from '../services/objectService';
const TYPE_ICON = {
    animal: _jsx(MdPets, { size: 16 }),
    bird: _jsx(GiBirdCage, { size: 16 }),
    tree: _jsx(MdPark, { size: 16 }),
    landmark: _jsx(MdAccountBalance, { size: 16 }),
};
const TYPE_LABEL = {
    animal: { en: 'Animal', fr: 'Animal', rw: 'Inyamaswa' },
    bird: { en: 'Bird', fr: 'Oiseau', rw: 'Inyoni' },
    tree: { en: 'Tree', fr: 'Arbre', rw: 'Igiti' },
    landmark: { en: 'Landmark', fr: 'Monument', rw: 'Akaranga' },
};
const FUN_FACTS = {
    animal: 'Animals in this park are protected under national conservation law.',
    bird: 'Birds play a vital role in seed dispersal and ecosystem balance.',
    tree: 'Trees absorb CO₂ and produce oxygen for hundreds of living organisms.',
    landmark: 'Cultural landmarks preserve the history and identity of a community.',
};
export default function ObjectPage() {
    const { id, nfcId, qrCode } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [object, setObject] = useState(null);
    const [nearby, setNearby] = useState([]);
    const [error, setError] = useState(null);
    const [playing, setPlaying] = useState(false);
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
                fetchNearby(obj.latitude, obj.longitude, 300)
                    .then(list => setNearby(list.filter(n => n.id !== obj.id).slice(0, 4)))
                    .catch(() => null);
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
    const lang = ['en', 'fr', 'rw'].includes(i18n.language) ? i18n.language : 'en';
    if (error)
        return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center gap-4", children: [_jsx(MdOutlinePlace, { size: 40, className: "text-slate-200" }), _jsx("p", { className: "text-slate-500 text-sm", children: error }), _jsx("button", { onClick: () => navigate('/'), className: "text-blue-500 text-sm underline", children: t('backToHome') })] }));
    if (!object)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-white", children: _jsx("div", { className: "w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" }) }));
    const typeLabel = TYPE_LABEL[object.type]?.[lang] ?? object.type;
    const funFact = FUN_FACTS[object.type] ?? FUN_FACTS.landmark;
    return (_jsxs("div", { className: "min-h-screen bg-white max-w-lg mx-auto flex flex-col", children: [_jsxs("div", { className: "relative flex-shrink-0", children: [object.imageUrl
                        ? _jsx("img", { src: object.imageUrl, alt: object.name, className: "w-full h-72 object-cover" })
                        : _jsx("div", { className: "w-full h-72 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center", children: _jsx(MdOutlinePlace, { size: 56, className: "text-slate-200" }) }), _jsx("button", { onClick: () => navigate(-1), className: "absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center", children: _jsx(HiArrowLeft, { size: 18 }) }), _jsx("div", { className: "absolute top-4 right-4", children: _jsx(LanguageSelector, {}) }), _jsxs("span", { className: "absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-semibold bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full capitalize", children: [TYPE_ICON[object.type] ?? _jsx(MdOutlinePlace, { size: 14 }), typeLabel] })] }), _jsxs("div", { className: "flex-1 px-5 py-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-800 leading-tight", children: object.name }), _jsxs("p", { className: "flex items-center gap-1 text-xs text-slate-400 mt-1.5", children: [_jsx(HiLocationMarker, { size: 13 }), object.latitude.toFixed(4), ", ", object.longitude.toFixed(4)] })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: _jsxs("span", { className: "flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium", children: [TYPE_ICON[object.type], " ", typeLabel] }) }), _jsx("p", { className: "text-slate-600 text-sm leading-relaxed", children: object.description }), object.audioUrl && (_jsxs("div", { children: [_jsxs("button", { onClick: toggleAudio, className: `flex items-center gap-3 w-full px-5 py-4 rounded-2xl border transition active:scale-95 ${playing
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200'
                                    : 'bg-white border-blue-200 text-blue-500 hover:bg-blue-50'}`, children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${playing ? 'bg-white/20' : 'bg-blue-50'}`, children: playing ? _jsx(HiVolumeUp, { size: 20 }) : _jsx(HiVolumeOff, { size: 20 }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-sm font-semibold", children: playing ? t('pauseNarration') : t('listenNarration') }), _jsx("p", { className: `text-xs mt-0.5 ${playing ? 'text-blue-100' : 'text-slate-400'}`, children: playing ? 'Playing audio guide…' : 'Tap to hear the audio guide' })] })] }), _jsx("audio", { ref: audioRef, src: object.audioUrl, onEnded: () => setPlaying(false) })] })), nearby.length > 0 && (_jsxs("div", { children: [_jsxs("h2", { className: "text-sm font-bold text-slate-700 mb-3 flex items-center gap-2", children: [_jsx(HiLocationMarker, { size: 15, className: "text-blue-400" }), t('nearbyAttractions')] }), _jsx("div", { className: "space-y-2", children: nearby.map(n => (_jsxs("button", { onClick: () => navigate(`/object/${n.id}`), className: "w-full flex items-center gap-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-2xl px-4 py-3 transition text-left", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 text-blue-400", children: TYPE_ICON[n.type] ?? _jsx(MdOutlinePlace, { size: 16 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-slate-700 truncate", children: n.name }), _jsx("p", { className: "text-xs text-slate-400 capitalize", children: TYPE_LABEL[n.type]?.[lang] ?? n.type })] }), _jsx(HiChevronRight, { size: 16, className: "text-slate-300 flex-shrink-0" })] }, n.id))) })] })), _jsxs("div", { className: "bg-blue-50 border border-blue-100 rounded-2xl px-4 py-4 flex gap-3", children: [_jsx(HiLightBulb, { size: 20, className: "text-blue-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold text-blue-600 mb-1", children: t('funFacts') }), _jsx("p", { className: "text-sm text-slate-600 leading-relaxed", children: funFact })] })] })] })] }));
}
