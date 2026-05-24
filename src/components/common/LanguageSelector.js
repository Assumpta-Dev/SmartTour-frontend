import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
const LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'rw', label: 'RW' },
];
export default function LanguageSelector() {
    const { i18n } = useTranslation();
    return (_jsx("div", { className: "flex items-center gap-1 bg-slate-100 rounded-full p-1", children: LANGS.map(l => (_jsx("button", { onClick: () => i18n.changeLanguage(l.code), className: `px-3 py-1 rounded-full text-xs font-semibold transition ${i18n.language === l.code
                ? 'bg-white text-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'}`, children: l.label }, l.code))) }));
}
