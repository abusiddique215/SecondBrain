import { HuggingFaceInference } from "langchain/llms/huggingface";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

// Make sure to set your Hugging Face API token in your environment variables
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HUGGINGFACE_API_KEY) {
  throw new Error("HUGGINGFACE_API_KEY is not set in the environment variables");
}

const model = new HuggingFaceInference({
  apiKey: HUGGINGFACE_API_KEY,
  model: "gpt2", // You can change this to a more suitable model
});

const template = `
Analyze the following transcript and provide:
1. A brief summary
2. Key topics discussed
3. Important entities mentioned

Transcript: {transcript}

Summary:
Topics:
Entities:
`;

const prompt = new PromptTemplate({
  template: template,
  inputVariables: ["transcript"],
});

const chain = new LLMChain({ llm: model, prompt: prompt });

export const analyzeText = async (transcript: string) => {
  const result = await chain.call({ transcript: transcript });
  
  const [summary, topicsRaw, entitiesRaw] = result.text.split('\n\n').slice(1);
  
  const topics = topicsRaw.split('\n').map(topic => topic.trim()).filter(Boolean);
  const entities = entitiesRaw.split('\n').map(entity => entity.trim()).filter(Boolean);

  return {
    summary: summary.trim(),
    topics,
    entities,
  };
};
