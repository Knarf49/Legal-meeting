import { ChatOpenAI } from "@langchain/openai";

export function createLlm(model: string) {
  const llm = new ChatOpenAI({
    model: model,
    apiKey: process.env.OPENAI_API_KEY,
  });
  return llm;
}
