import { useState } from 'react';
import { askAI } from '../../services/aiService';

export default function AIAssistant({ contextObjectId }: { contextObjectId: string }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer]     = useState('');
  const [loading, setLoading]   = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const res = await askAI(question, contextObjectId);
    setAnswer(res);
    setLoading(false);
  };

  return (
    <div className="bg-blue-50 rounded-xl p-4">
      <h3 className="font-semibold text-gray-700 mb-2">Ask the AI Guide</h3>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          placeholder="e.g. How old is this tree?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <button onClick={handleAsk} className="bg-blue-400 text-white px-4 py-2 rounded-lg text-sm">
          Ask
        </button>
      </div>
      {loading && <p className="text-xs text-gray-400 mt-2">Thinking...</p>}
      {answer  && <p className="text-sm text-gray-700 mt-3 bg-white rounded-lg p-3">{answer}</p>}
    </div>
  );
}
