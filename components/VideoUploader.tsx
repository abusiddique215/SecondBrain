import React, { useRef, useState } from 'react';
import AnalysisResults from './AnalysisResults';
import { useVideo } from '../contexts/VideoContext';
import axios from 'axios';
import { analyzeFrames } from '../utils/tensorflow';
import { transcribeAudio } from '../utils/speechRecognition';
import { analyzeText } from '../utils/langchain';
import { saveAnalysisResults, searchVideos } from '../utils/db';

const VideoUploader: React.FC = () => {
  const { videoFile, setVideoFile, analysisResults, setAnalysisResults } = useVideo();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'mp4' || fileExtension === 'mov') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setVideoFile({
            file,
            name: file.name,
            size: file.size,
            url: e.target?.result as string,
          });
        };
        reader.readAsDataURL(file);
        setAnalysisResults(null);
        setError(null);
      } else {
        setError('Please select a valid .mp4 or .mov video file.');
        setVideoFile(null);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleUploadClick();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const extractFrames = (video: HTMLVideoElement, frameCount: number): HTMLImageElement[] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: HTMLImageElement[] = [];

    for (let i = 0; i < frameCount; i++) {
      video.currentTime = (i / frameCount) * video.duration;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const img = new Image();
      img.src = canvas.toDataURL();
      frames.push(img);
    }

    return frames;
  };

  const handleProcessVideo = async () => {
    if (!videoFile || !videoRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', videoFile.file);

      const response = await axios.post('/api/process-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Video processing completed:', response.data);

      // Extract frames
      const frames = extractFrames(videoRef.current, 5);

      // Perform client-side image classification on all frames
      const frameAnalyses = await analyzeFrames(frames);

      // Combine all frame analyses
      const allTags = frameAnalyses.flat();
      const uniqueTags = Array.from(new Set(allTags));

      // Perform speech-to-text transcription
      const audioBlob = await fetch(response.data.audioPath).then(res => res.blob());
      const transcript = await transcribeAudio(audioBlob);

      // Analyze the transcript using LangChain
      const textAnalysis = await analyzeText(transcript);

      const analysisResults = {
        title: 'Analyzed Video',
        description: textAnalysis.summary,
        tags: [...uniqueTags, ...textAnalysis.topics],
        transcript: transcript,
        entities: textAnalysis.entities,
      };

      // Save analysis results to the database
      const id = await saveAnalysisResults(videoFile.name, analysisResults);

      setAnalysisResults({ ...analysisResults, id });
    } catch (error) {
      console.error('Error processing video:', error);
      setError('Error processing video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      const results = await searchVideos(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching videos:', error);
      setError('Error searching videos. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
          onClick={handleUploadClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label="Upload video file"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".mp4,.mov"
            className="hidden"
          />
          {videoFile ? (
            <div>
              <p className="text-lg font-semibold">{videoFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(videoFile.size)}</p>
              <video ref={videoRef} className="mt-4 max-w-full" controls>
                <source src={videoFile.url} type={`video/${videoFile.name.split('.').pop()}`} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <p className="text-gray-500">
              Click or drag a video file (.mp4 or .mov) here to upload
            </p>
          )}
        </div>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
        {videoFile && (
          <div className="mt-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleProcessVideo}
            >
              Process Video
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Search Videos</h3>
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter search query"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Search Results:</h4>
            <ul className="list-disc pl-5">
              {searchResults.map((result) => (
                <li key={result.id} className="mb-2">
                  {result.filename} (Score: {result.score.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AnalysisResults />
    </div>
  );
};

export default VideoUploader;
