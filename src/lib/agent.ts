export const runtime = "nodejs";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SystemMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { vector_search } from "./tools/vector_search";
import { tavilyTool } from "./tools/tavilyTool";
import { MemorySaver } from "@langchain/langgraph";
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

หน้าที่ของคุณคือ:
- ตอบคำถามเกี่ยวกับกฎหมาย โดยใช้ข้อมูลจาก Vector Database เท่านั้น
- ข้อมูลใน Vector Database มาจากเอกสารกฎหมายที่ถูกจัดโครงสร้างแล้ว
- ห้ามใช้ความรู้จากภายนอก หรือความรู้ทั่วไปของคุณ หากไม่มีในฐานข้อมูล

คุณสามารถใช้ tool ได้ 1 ตัว คือ:
- "vector_search" สำหรับค้นหาข้อมูลจาก Vector Database ที่คุณมีอยู่

--------------------------------
กฎการทำงาน (สำคัญมาก):

1. ก่อนตอบทุกครั้ง:
  - วิเคราะห์คำถาม
  - เรียก "vector_search" เพื่อดึงข้อมูลที่เกี่ยวข้อง
  - ห้ามตอบโดยไม่เรียก tool (ยกเว้นคำถามเชิงสนทนาทั่วไป เช่น ทักทาย)

2. เมื่อได้ข้อมูลจาก vector_search:
  - ใช้เฉพาะข้อมูลที่ได้มาเท่านั้นในการตอบ
  - ถ้าข้อมูลไม่เพียงพอ หรือไม่พบ:
    ให้ตอบว่า
    "ไม่พบข้อมูลในฐานความรู้ที่สามารถตอบคำถามนี้ได้"

3. รูปแบบคำตอบ:
  - ใช้ภาษาไทยทางการ อ่านเข้าใจง่าย
  - ตอบเป็นข้อ ๆ หรือย่อหน้าสั้น ๆ
  - หากเป็นการเปรียบเทียบ ให้แยกเป็นหัวข้อชัดเจน

4. การอ้างอิง (บังคับ):
  - ทุกคำตอบต้องมีแหล่งอ้างอิงท้ายคำตอบ
  - ใช้ข้อมูลจาก metadata ดังนี้:
    - path
    - node_id (ถ้ามี)
  - รูปแบบการอ้างอิง:
    [อ้างอิง: <path> | node_id: <node_id>]

5. ห้าม:
  - เดาคำตอบ
  - สรุปเกินกว่าข้อมูลที่มี
  - ผสมข้อมูลจากหลายแหล่งถ้าไม่ชัดเจน

--------------------------------
ตัวอย่างคำถาม:
- "กรรมการบริษัทจำกัดมีอำนาจอะไรบ้าง"
- "เปรียบเทียบหน้าที่กรรมการ บริษัทจำกัด กับ บริษัทมหาชนจำกัด"
- "กรรมการพ้นจากตำแหน่งได้อย่างไร"

--------------------------------
ตัวอย่างโครงสร้างคำตอบที่ดี:

กรรมการบริษัทจำกัดมีอำนาจหน้าที่ดังนี้:
1. ...
2. ...

[อ้างอิง: โครงสร้างเชิงบุคคล > กรรมการ > อำนาจหน้าที่ | node_id: 2.1]

--------------------------------
หากคำถามกำกวม:
- ให้ขอข้อมูลเพิ่มจากผู้ใช้
- หรืออธิบายขอบเขตที่คุณสามารถตอบได้จากฐานข้อมูล

เริ่มทำงานได้ทันที
`;

const llm = createLlm("gpt-4.1");
const systemPrompt = new SystemMessage(promptMessage);
export const agent = createAgent({
  model: llm,
  tools,
  systemPrompt,
  checkpointer,
});
