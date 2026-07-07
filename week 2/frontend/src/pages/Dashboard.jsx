import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Loader2 } from 'lucide-react';
import { processWorkflow } from '../api';

export default function Dashboard({ setAnalysisData }) {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !jobDesc || !company) return alert('Please fill all fields');
        
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('job_description', jobDesc);
        formData.append('company_name', company);

        try {
            const data = await processWorkflow(formData);
            if(data.error) throw new Error(data.error);
            setAnalysisData(data);
            navigate('/results');
        } catch (error) {
            console.error(error);
            alert('Analysis failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">New Application Analysis</h1>
            <p className="text-slate-500 mb-8">Upload your resume and the target job description to get started.</p>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Target Company Name</label>
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Google, Stripe" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
                    <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={6} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Paste the full job description here..." />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Resume (PDF)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition">
                        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="resume-upload" />
                        <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                            <UploadCloud className="text-blue-500 mb-2" size={32} />
                            <span className="text-slate-600 font-medium">{file ? file.name : 'Click to browse or drag and drop'}</span>
                            <span className="text-slate-400 text-sm mt-1">PDF up to 5MB</span>
                        </label>
                    </div>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center">
                    {loading ? <><Loader2 className="animate-spin mr-2" /> Analyzing Profile...</> : 'Analyze & Prepare'}
                </button>
            </form>
        </div>
    );
}