import FAISS from 'faiss-node';
import * as tf from '@tensorflow/tfjs-node';

let index: FAISS.Index | null = null;

export const initFAISS = async (dimension: number) => {
  if (!index) {
    index = new FAISS.Index(dimension);
  }
  return index;
};

export const addEmbedding = async (id: string, embedding: number[]) => {
  if (!index) {
    throw new Error('FAISS index not initialized');
  }
  index.add(embedding, id);
};

export const searchEmbeddings = async (queryEmbedding: number[], k: number) => {
  if (!index) {
    throw new Error('FAISS index not initialized');
  }
  return index.search(queryEmbedding, k);
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  // Load the Universal Sentence Encoder model
  const model = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/universal-sentence-encoder-lite/1/default/1', { fromTFHub: true });

  // Generate embedding
  const embeddings = await model.embed([text]);
  const embeddingArray = await embeddings.array();
  return embeddingArray[0];
};
