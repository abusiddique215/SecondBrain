import { HuggingFaceInference } from "langchain/llms/hf";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const model = new HuggingFaceInference({
  apiKey: process.env.HUGGINGFACE_API_KEY, // Make sure to set this in your .env file
  model: "facebook/bart-large-cnn",
});

export const analyzeText = async (text: string) => {
  // Split the text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);

  // Summarize the text
  const chain = loadSummarizationChain(model, { type: "map_reduce" });
  const res = await chain.call({
    input_documents: docs,
  });

  // Extract entities and topics (this is a simplified version, you might want to use a more sophisticated NER model)
  const entities = await model.call(`Extract named entities from this text: ${text}`);
  const topics = await model.call(`What are the main topics discussed in this text: ${text}`);

  return {
    summary: res.text,
    entities: entities.split(',').map((e: string) => e.trim()),
    topics: topics.split(',').map((t: string) => t.trim()),
  };
};
