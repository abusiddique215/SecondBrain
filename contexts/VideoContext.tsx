import React, { createContext, useState, useContext, ReactNode } from 'react';

type VideoFile = {
  file: File;
  name: string;
  size: number;
  url: string;
};

type AnalysisResult = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  transcript: string;
  entities: string[];
};

type VideoContextType = {
  videoFile: VideoFile | null;
  setVideoFile: (file: VideoFile | null) => void;
  analysisResults: AnalysisResult | null;
  setAnalysisResults: (results: AnalysisResult | null) => void;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  return (
    <VideoContext.Provider value={{ videoFile, setVideoFile, analysisResults, setAnalysisResults }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};
