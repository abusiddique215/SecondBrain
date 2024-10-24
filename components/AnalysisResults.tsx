import React from 'react';
import { useVideo } from '../contexts/VideoContext';

const AnalysisResults: React.FC = () => {
  const { analysisResults } = useVideo();

  if (!analysisResults) return null;

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Title:</h4>
          <p>{analysisResults.title}</p>
        </div>
        <div>
          <h4 className="font-semibold">Summary:</h4>
          <p>{analysisResults.description}</p>
        </div>
        <div>
          <h4 className="font-semibold">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {analysisResults.tags.map((tag, index) => (
              <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold">Entities:</h4>
          <div className="flex flex-wrap gap-2">
            {analysisResults.entities.map((entity, index) => (
              <span key={index} className="bg-blue-200 px-2 py-1 rounded-full text-sm">
                {entity}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold">Transcript:</h4>
          <p className="max-h-40 overflow-y-auto">{analysisResults.transcript}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
