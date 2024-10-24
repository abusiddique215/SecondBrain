import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Load the MobileNet model
let model: mobilenet.MobileNet | null = null;

export const loadModel = async () => {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
};

// Function to process an image and return top predictions
export const classifyImage = async (imageElement: HTMLImageElement): Promise<string[]> => {
  const model = await loadModel();
  const predictions = await model.classify(imageElement);
  return predictions.map(p => `${p.className} (${(p.probability * 100).toFixed(2)}%)`);
};

export const analyzeFrames = async (frames: HTMLImageElement[]): Promise<string[][]> => {
  const model = await loadModel();
  const results = await Promise.all(frames.map(frame => model.classify(frame)));
  return results.map(predictions => 
    predictions.map(p => `${p.className} (${(p.probability * 100).toFixed(2)}%)`)
  );
};
