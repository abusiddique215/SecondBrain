import React from 'react';
import type { NextPage } from 'next';
import VideoUploader from '../components/VideoUploader';
import { VideoProvider } from '../contexts/VideoContext';

const Home: NextPage = () => {
  return (
    <VideoProvider>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center my-8">YouTube Second Brain</h1>
        <VideoUploader />
      </div>
    </VideoProvider>
  );
};

export default Home;
