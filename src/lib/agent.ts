export const runtime = "nodejs";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SystemMessage } from "@langchain/core/messages";
import { createAgent, type BaseMessage } from "langchain";
import { vector_search } from "./tools/vector_search";
import { tavilyTool } from "./tools/tavilyTool";
import {
  MemorySaver,
  type LangGraphRunnableConfig,
} from "@langchain/langgraph";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createLlm } from "./llm";

const checkpointer = new MemorySaver();

const tools = [vector_search, tavilyTool];

export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: process.env.OPENAI_API_KEY as string,
});

export const vectorStore = new Chroma(embeddings, {
  collectionName: "law",
  chromaCloudAPIKey: process.env.CHROMA_API_KEY,
  clientParams: {
    host: "api.trychroma.com",
    port: 8000,
    ssl: true,
    tenant: process.env.CHROMA_TENANT,
    database: process.env.CHROMA_DATABASE,
  },
});

const promptMessage = `
คุณคือผู้ช่วยด้านกฎหมายไทย (Legal AI Assistant)

ข้อมูลทั้งหมดของคุณต้องมาจาก Vector Database เท่านั้น
ห้ามใช้ความรู้ทั่วไปหรือความรู้ภายนอกโดยเด็ดขาด

==================================================
เครื่องมือที่ใช้ได้:
- vector_search: สำหรับค้นหาข้อมูลจาก Vector Database

==================================================
กฎการทำงาน (บังคับ):

1) ก่อนตอบทุกครั้ง:
- วิเคราะห์คำถามของผู้ใช้
- เรียกใช้ vector_search เสมอ (ยกเว้นคำถามทักทาย)
- ห้ามตอบหากไม่ได้ใช้ tool

2) หลังจากได้ข้อมูลจาก vector_search:
- ใช้เฉพาะข้อมูลที่ได้จาก tool เท่านั้น
- ห้ามเดา
- ห้ามขยายความเกินข้อมูล
- หากไม่พบข้อมูลที่เกี่ยวข้อง ให้ตอบตาม schema โดยระบุว่าไม่พบข้อมูล

==================================================
กฎการจัดข้อมูล:

- title: หัวข้อสั้น กระชับ
- sections:
  - แสดงเฉพาะ section ที่มีข้อมูลจากฐานข้อมูล
  - items ต้องเป็นข้อความตามเอกสารจริง
- references:
  - ต้องมีทุกคำตอบ
  - ใช้ metadata จาก vector_search เท่านั้น
  - ห้ามซ้ำ

==================================================
หากข้อมูลไม่เพียงพอ:

- title ให้ระบุว่า "ไม่พบข้อมูลในฐานความรู้"
- sections ให้เป็น array ว่าง
- references ให้เป็น array ว่าง

เริ่มทำงานได้ทันที


`;

const llm = createLlm("gpt-4.1");
const systemPrompt = new SystemMessage(promptMessage);
export const agent = createAgent({
  model: llm,
  tools,
  checkpointer,
  systemPrompt,
});

export async function callAgent(options: {
  input: Record<string, unknown>;
  config: LangGraphRunnableConfig & {
    configurable: {
      thread_id: string;
    };
  };
}) {
  const stream = await agent.stream(
    options.input as {
      messages: BaseMessage[];
    },
    {
      configurable: {
        thread_id: options.config.configurable.thread_id,
      },
      encoding: "text/event-stream",
      streamMode: ["values", "updates", "messages"],
      recursionLimit: 10,
    }
  );

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
