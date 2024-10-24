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

export const searchVideos = async (query: string, k: number = 5) => {
  const queryEmbedding = await generateEmbedding(query);
  const results = await searchEmbeddings(queryEmbedding, k);

  await db.read();
  return results.map(result => ({
    ...db.data.videos.find(video => video.id === result.id),
    score: result.score
  })).filter(Boolean);
}
