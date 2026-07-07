import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, MessagesSquare, Settings } from 'lucide-react';
import { useState } from 'react';

import Dashboard from './pages/Dashboard';
import Results from './pages/Results';
import InterviewPrep from './pages/InterviewPrep';

function Sidebar() {
    const location = useLocation();
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/results', label: 'Analysis Results', icon: FileText },
        { path: '/interview', label: 'Interview Prep', icon: MessagesSquare },
    ];

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
            <div className="text-2xl font-bold text-blue-400 mb-8 pl-2 mt-4">HirePrep AI</div>
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default function App() {
    const [analysisData, setAnalysisData] = useState(null);

    return (
        <Router>
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto h-screen">
                    <Routes>
                        <Route path="/" element={<Dashboard setAnalysisData={setAnalysisData} />} />
                        <Route path="/results" element={<Results data={analysisData} />} />
                        <Route path="/interview" element={<InterviewPrep data={analysisData} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}