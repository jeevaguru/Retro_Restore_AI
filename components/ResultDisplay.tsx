import React from 'react';
import Loader from './Loader';

interface ResultDisplayProps {
  editedImage: string | null;
  isLoading: boolean;
  loadingMessage: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ editedImage, isLoading, loadingMessage }) => {
  return (
    <div className="relative w-full aspect-square bg-slate-800 rounded-lg shadow-xl flex items-center justify-center overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
          <Loader />
          <p className="text-slate-300 mt-4">{loadingMessage}</p>
        </div>
      )}
      {editedImage ? (
        <img src={editedImage} alt="Edited" className="w-full h-full object-contain" />
      ) : (
        !isLoading && (
          <div className="text-slate-500 text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">Your restored photo will appear here.</p>
          </div>
        )
      )}
    </div>
  );
};

export default ResultDisplay;