import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const processWorkflow = async (formData) => {
    const response = await axios.post(`${API_URL}/process-workflow`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const generateLatex = async () => {
    const response = await axios.post(`${API_URL}/generate-full-latex`);
    return response.data;
};

export const downloadPdf = async (latexCode) => {
    const response = await axios.post(`${API_URL}/compile-pdf`, { latex_code: latexCode }, {
        responseType: 'blob' 
    });
    return response.data;
};

export const evaluateAnswer = async (question, userAnswer) => {
    const response = await axios.post(`${API_URL}/evaluate-answer`, { question, user_answer: userAnswer });
    return response.data;
};