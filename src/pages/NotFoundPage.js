import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { HiOutlineLocationMarker } from 'react-icons/hi';
export default function NotFoundPage() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-white gap-4 px-6 text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center", children: _jsx(HiOutlineLocationMarker, { size: 30, className: "text-slate-300" }) }), _jsx("p", { className: "text-slate-800 font-semibold", children: "Page not found" }), _jsx("p", { className: "text-slate-400 text-sm", children: "The page you're looking for doesn't exist." }), _jsx("button", { onClick: () => navigate('/'), className: "text-blue-500 text-sm underline", children: "Go home" })] }));
}
