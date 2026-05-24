import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { askAI } from '../../services/aiService';
export default function AIAssistant({ contextObjectId }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const handleAsk = async () => {
        if (!question.trim())
            return;
        setLoading(true);
        const res = await askAI(question, contextObjectId);
        setAnswer(res);
        setLoading(false);
    };
    return (_jsxs("div", { className: "bg-blue-50 rounded-xl p-4", children: [_jsx("h3", { className: "font-semibold text-gray-700 mb-2", children: "Ask the AI Guide" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm", placeholder: "e.g. How old is this tree?", value: question, onChange: (e) => setQuestion(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleAsk() }), _jsx("button", { onClick: handleAsk, className: "bg-blue-400 text-white px-4 py-2 rounded-lg text-sm", children: "Ask" })] }), loading && _jsx("p", { className: "text-xs text-gray-400 mt-2", children: "Thinking..." }), answer && _jsx("p", { className: "text-sm text-gray-700 mt-3 bg-white rounded-lg p-3", children: answer })] }));
}
