import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Download, CheckCircle, AlertTriangle, Loader2, FileCode, Copy } from 'lucide-react';
import { generateLatex, downloadPdf } from '../api';

export default function Results({ data }) {
    if (!data) return <Navigate to="/" />;

    const [isGenerating, setIsGenerating] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [latexCode, setLatexCode] = useState(null);

    const handleGenerateLatex = async () => {
        setIsGenerating(true);
        try {
            const latexRes = await generateLatex();
            if(latexRes.error) throw new Error(latexRes.error);
            // Save the raw Overleaf code to state so the user can see it
            setLatexCode(latexRes.latex_code);
        } catch (error) {
            alert("Failed to generate code:\n\n" + error.message);
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!latexCode) return;
        setIsCompiling(true);
        try {
            const pdfBlob = await downloadPdf(latexCode);
            
            // Check if the backend returned a JSON error instead of a PDF file
            if (pdfBlob.type === 'application/json') {
                const text = await pdfBlob.text();
                const errorData = JSON.parse(text);
                
                let errorMessage = errorData.error || "PDF compilation failed on server.";
                
                // Show the exact compiler logs so we know what went wrong
                if (errorData.logs) {
                    const logLines = errorData.logs.split('\n');
                    const importantLogs = logLines.slice(-15).join('\n');
                    errorMessage += "\n\nCompiler Output:\n" + importantLogs;
                    console.error("Full LaTeX Logs:", errorData.logs);
                }
                
                throw new Error(errorMessage);
            }

            // Download the file
            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Optimized_Resume.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert("Failed to compile PDF:\n\n" + error.message);
            console.error(error);
        } finally {
            setIsCompiling(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(latexCode);
        alert("Overleaf LaTeX code copied to clipboard! You can now paste it into Overleaf.");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Match Analysis</h1>
                    <p className="text-slate-500">How your profile stacks up against the job requirements.</p>
                </div>
                <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="text-4xl font-bold text-blue-600">{data.ats_score}%</div>
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">ATS<br/>Match</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-3">Executive Summary</h3>
                <p className="text-slate-600 leading-relaxed">{data.match_analysis}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><AlertTriangle size={18} className="text-amber-500 mr-2"/> Missing Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skill_gap_analysis.missing_technical_skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100">{skill}</span>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><CheckCircle size={18} className="text-blue-500 mr-2"/> Recommended Learning Path</h3>
                    <ul className="space-y-3">
                        {data.skill_gap_analysis.recommended_learning_path.map((step, i) => (
                            <li key={i} className="flex items-start">
                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">{i+1}</div>
                                <span className="text-slate-600 text-sm">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* NEW ENHANCED RESUME EXPORT BLOCK */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl mt-8 flex flex-col items-start justify-between">
                <div className="flex flex-col md:flex-row w-full justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2">Generate Optimized Resume</h2>
                        <p className="text-slate-400 text-sm max-w-md">We will rewrite your resume into a professional ATS-optimized LaTeX template, automatically including missing required skills.</p>
                    </div>
                    
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        {/* Step 1: Generate Code */}
                        {!latexCode ? (
                            <button onClick={handleGenerateLatex} disabled={isGenerating} className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition disabled:opacity-50">
                                {isGenerating ? <Loader2 className="animate-spin mr-2" size={18}/> : <FileCode className="mr-2" size={18}/>}
                                {isGenerating ? 'Writing Code...' : 'Generate Resume Code'}
                            </button>
                        ) : (
                            /* Step 2: Code is ready, show Copy and Download buttons */
                            <>
                                <button onClick={copyToClipboard} className="flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition">
                                    <Copy className="mr-2" size={18}/> Copy Overleaf Code
                                </button>
                                <button onClick={handleDownloadPdf} disabled={isCompiling} className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition disabled:opacity-50">
                                    {isCompiling ? <Loader2 className="animate-spin mr-2" size={18}/> : <Download className="mr-2" size={18}/>}
                                    {isCompiling ? 'Compiling PDF...' : 'Download PDF'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Display the raw LaTeX code directly on the screen */}
                {latexCode && (
                    <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                                <FileCode size={14} className="mr-2" /> Raw LaTeX (Overleaf) Source
                            </span>
                        </div>
                        <pre className="text-xs text-slate-300 overflow-x-auto overflow-y-auto max-h-96 p-4 bg-slate-900 rounded-lg custom-scrollbar font-mono leading-relaxed">
                            {latexCode}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}