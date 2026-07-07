import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Send, Loader2, Award, Zap, AlertCircle } from 'lucide-react';
import { evaluateAnswer } from '../api';

function PracticeModal({ questionData, onClose }) {
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async () => {
        if(!answer.trim()) return;
        setLoading(true);
        try {
            const evaluation = await evaluateAnswer(questionData.question, answer);
            setResult(evaluation);
        } catch(e) {
            alert('Evaluation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Practice Mode</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-900 font-medium">
                        Q: {questionData.question}
                    </div>

                    {!result ? (
                        <div className="space-y-4">
                            <textarea 
                                value={answer} 
                                onChange={(e) => setAnswer(e.target.value)} 
                                rows={6} 
                                placeholder="Type your answer here using the STAR method (Situation, Task, Action, Result)..."
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                            <button onClick={handleSubmit} disabled={loading} className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition flex justify-center items-center">
                                {loading ? <><Loader2 className="animate-spin mr-2"/> Evaluating...</> : <><Send size={18} className="mr-2"/> Submit Answer</>}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className={`text-3xl font-black ${result.score > 80 ? 'text-green-500' : result.score > 60 ? 'text-amber-500' : 'text-red-500'}`}>
                                    {result.score}/100
                                </div>
                                <div className="text-slate-500 font-medium">Answer Score</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                                    <h4 className="font-bold text-green-800 mb-2 flex items-center"><Award size={16} className="mr-2"/> Strengths</h4>
                                    <ul className="list-disc pl-4 text-sm text-green-700 space-y-1">
                                        {result.strengths.map((s,i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                                    <h4 className="font-bold text-red-800 mb-2 flex items-center"><AlertCircle size={16} className="mr-2"/> Missing Points</h4>
                                    <ul className="list-disc pl-4 text-sm text-red-700 space-y-1">
                                        {result.missing_points.map((m,i) => <li key={i}>{m}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-2 flex items-center"><Zap size={16} className="text-yellow-500 mr-2"/> Improved Answer</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{result.improved_answer}</p>
                            </div>

                            <button onClick={() => setResult(null)} className="w-full bg-slate-200 text-slate-800 font-medium py-3 rounded-xl hover:bg-slate-300 transition">Try Again</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function InterviewPrep({ data }) {
    if (!data) return <Navigate to="/" />;
    
    const [activeModal, setActiveModal] = useState(null);
    const questions = data.interview_questions || [];

    const difficultyColors = {
        'Beginner': 'bg-green-100 text-green-700',
        'Intermediate': 'bg-blue-100 text-blue-700',
        'Advanced': 'bg-purple-100 text-purple-700',
        'Expert': 'bg-red-100 text-red-700'
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Interview Simulator</h1>
            <p className="text-slate-500 mb-8">18 progressively difficult questions tailored to your target role.</p>

            <div className="space-y-4">
                {questions.map((q, index) => (
                    <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex space-x-2 mb-3">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wider">{q.category}</span>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${difficultyColors[q.difficulty] || 'bg-slate-100'}`}>{q.difficulty}</span>
                            </div>
                            <span className="text-slate-300 font-bold text-xl">#{index + 1}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{q.question}</h3>
                        <p className="text-sm text-slate-500 mb-6 border-l-2 border-blue-400 pl-3 italic">Why asked: {q.why_asked}</p>
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => setActiveModal(q)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition text-sm flex items-center">
                                Practice Answer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {activeModal && <PracticeModal questionData={activeModal} onClose={() => setActiveModal(null)} />}
        </div>
    );
}