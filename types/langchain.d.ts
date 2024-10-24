declare module 'langchain/llms/huggingface' {
  export class HuggingFaceInference {
    constructor(config: { apiKey: string; model: string });
  }
}

declare module 'langchain/prompts' {
  export class PromptTemplate {
    constructor(config: { template: string; inputVariables: string[] });
  }
}

declare module 'langchain/chains' {
  export class LLMChain {
    constructor(config: { llm: any; prompt: any });
    call(params: any): Promise<any>;
  }
}
