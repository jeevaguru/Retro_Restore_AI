import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { editImageWithPrompt } from './services/geminiService';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { fileToBase64 } from './utils/fileUtils';

const DEFAULT_PROMPT = "Colorize and repair this old black and white photo, and upscale it to high definition while carefully maintaining and enhancing the facial features of the people in the photo. Make the colors look natural and period-appropriate.";

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [enhancementPrompt, setEnhancementPrompt] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Restoring your memory...');

  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      setEditedImage(null);
      const base64Image = await fileToBase64(file);
      setOriginalImage(base64Image);
    } catch (err) {
      setError('Failed to read the image file. Please try another one.');
      console.error(err);
    }
  };

  const handleInitialRestore = useCallback(async () => {
    if (!originalImage || !prompt) {
      setError('Please upload an image and provide a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    setLoadingMessage('Restoring your memory...');

    try {
      const result = await editImageWithPrompt(originalImage, prompt);
      setEditedImage(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Image generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);

  const handleApplyEnhancement = useCallback(async () => {
    if (!editedImage || !enhancementPrompt) {
      setError('Please provide enhancement instructions.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Applying enhancement...');

    try {
      const result = await editImageWithPrompt(editedImage, enhancementPrompt);
      setEditedImage(result);
      setEnhancementPrompt('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Image enhancement failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [editedImage, enhancementPrompt]);

  const handleStartOver = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setError(null);
    setIsLoading(false);
    setPrompt(DEFAULT_PROMPT);
    setEnhancementPrompt('');
  };
  
  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `restored-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderControlPanel = () => {
    if (editedImage) {
      return (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg flex flex-col gap-4">
             <label htmlFor="enhancementPrompt" className="text-lg font-semibold text-slate-300">
                Further Enhancement Instructions
              </label>
              <textarea
                id="enhancementPrompt"
                placeholder="e.g., Make the sky more blue, add a 1950s film grain"
                value={enhancementPrompt}
                onChange={(e) => setEnhancementPrompt(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 resize-none h-24"
                rows={3}
                disabled={isLoading}
              />
              <div className="flex flex-wrap gap-2">
                {['Make the image sharper', 'Boost the colors', 'Increase contrast', 'Add a vintage photo effect'].map(p => (
                  <button key={p} onClick={() => setEnhancementPrompt(p)} className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded-full transition-colors disabled:opacity-50" disabled={isLoading}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button
                  onClick={handleApplyEnhancement}
                  disabled={isLoading || !enhancementPrompt}
                  className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? 'Applying...' : 'Apply Enhancement'}
                  {!isLoading && <SparklesIcon className="w-5 h-5" />}
                </button>
                 <button 
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                 >
                  Download
                 </button>
                <button
                  onClick={handleStartOver}
                   disabled={isLoading}
                  className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200  disabled:bg-slate-700"
                >
                  Start Over
                </button>
              </div>
        </div>
      );
    }

    return (
       <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg flex flex-col gap-4">
          <label htmlFor="prompt" className="text-lg font-semibold text-slate-300">
            Restoration Instructions
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 resize-none h-32"
            rows={4}
            disabled={isLoading}
          />
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={handleInitialRestore}
              disabled={isLoading || !originalImage}
              className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Restoring...' : 'Restore Photo'}
              {!isLoading && <SparklesIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleStartOver}
              className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Start Over
            </button>
          </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {!originalImage ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold text-center text-slate-300">Original Photo</h2>
                  <img src={originalImage} alt="Original" className="rounded-lg shadow-xl w-full h-auto object-contain max-h-[60vh]" />
              </div>
              <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold text-center text-slate-300">Restored Photo</h2>
                   <ResultDisplay editedImage={editedImage} isLoading={isLoading} loadingMessage={loadingMessage} />
              </div>
            </div>

            {error && <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-center">{error}</div>}
            
            {originalImage && renderControlPanel()}

          </div>
        )}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Powered by Gemini 2.5 Flash Image. For demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;