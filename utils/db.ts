import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { initFAISS, addEmbedding, searchEmbeddings, generateEmbedding } from './faiss'

// Define a type for our database structure
type DbSchema = {
  videos: {
    id: string;
    filename: string;
    analysisResults: {
      title: string;
      description: string;
      tags: string[];
      transcript: string;
      entities: string[];
    };
  }[];
}

// Create a JSON file adapter
const adapter = new JSONFile<DbSchema>('db.json')
const db = new Low(adapter, { videos: [] })

// Initialize FAISS index
const EMBEDDING_DIMENSION = 512; // This should match the dimension of your embeddings
initFAISS(EMBEDDING_DIMENSION);

export const saveAnalysisResults = async (filename: string, analysisResults: DbSchema['videos'][0]['analysisResults']) => {
  await db.read()
  
  const id = Date.now().toString()
  db.data.videos.push({
    id,
    filename,
    analysisResults,
  })

  await db.write()

  // Generate and add embedding for the transcript
  const embedding = await generateEmbedding(analysisResults.transcript);
  await addEmbedding(id, embedding);

  return id
}

export const getAnalysisResults = async (id: string) => {
  await db.read()
  return db.data.videos.find(video => video.id === id)
}

export const getAllVideos = async () => {
  await db.read()
  return db.data.videos
}

type SearchResult = {
  id: string;
  score: number;
};

export const searchVideos = async (query: string, k: number = 5) => {
  const queryEmbedding = await generateEmbedding(query);
  const results = await searchEmbeddings(queryEmbedding, k);
  await db.read();
  if (!Array.isArray(results)) {
    return [];
  }
  return results
    .map(result => {
      const video = db.data.videos.find(v => v.id === result.id);
      return video ? { ...video, score: result.score } : null;
    })
    .filter((video): video is (DbSchema['videos'][0] & { score: number }) => video !== null);
}
