export const runtime = "nodejs";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SystemMessage } from "@langchain/core/messages";
import { createAgent, type BaseMessage } from "langchain";
import { vector_search } from "./tools/vector_search";
import { tavilyTool } from "./tools/tavilyTool";
import {
  END,
  type LangGraphRunnableConfig,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createLlm } from "./llm";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";
import z from "zod";

// Checkpointer
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // postgres://...
});
const checkpointer = new PostgresSaver(pool);

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
  systemPrompt,
});

//state
const InputState = z.object({
  thread_id: z.string().min(1),

  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system", "tool"]),
        content: z.string(),
      })
    )
    .min(1),
});

const OutputState = z.object({
  title: z.string(),

  sections: z.array(
    z.object({
      heading: z.string(),
      items: z.array(z.string()).min(1),
    })
  ),

  references: z.array(
    z.object({
      source: z.string(),
      page: z.string().optional(),
      law: z.string().optional(),
    })
  ),
});

const OverallStage = z.object({
  /* =======================
     META / THREAD
  ======================= */
  thread_id: z.string().min(1),

  /* =======================
     INPUT STAGE
  ======================= */
  input: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "system", "tool"]),
          content: z.string(),
        })
      )
      .min(1),
  }),

  /* =======================
     ANALYSIS STAGE
     (LLM internal reasoning / plan)
  ======================= */
  analysis: z.object({
    intent: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    requires_tool: z.boolean().default(true),
  }),

  /* =======================
     TOOL STAGE
  ======================= */
  tool: z.object({
    name: z.string().optional(),
    input: z.record(z.string(), z.any()).optional(),
    raw_result: z.any().optional(),
  }),

  /* =======================
     KNOWLEDGE STAGE
     (Parsed vector DB result)
  ======================= */
  knowledge: z
    .array(
      z.object({
        content: z.string(),
        metadata: z.record(z.string(), z.any()),
      })
    )
    .default([]),

  /* =======================
     OUTPUT STAGE
  ======================= */
  output: z.object({
    title: z.string(),

    sections: z.array(
      z.object({
        heading: z.string(),
        items: z.array(z.string()).min(1),
      })
    ),

    references: z.array(
      z.object({
        source: z.string(),
        page: z.string().optional(),
        law: z.string().optional(),
      })
    ),
  }),

  /* =======================
     STATUS / CONTROL
  ======================= */
  status: z.enum([
    "idle",
    "analyzing",
    "calling_tool",
    "processing_knowledge",
    "responding",
    "done",
    "error",
  ]),

  error: z.string().optional(),
});

//agent node
const agentNode = async (state) => {
  const result = await agent.invoke({
    messages: state.messages,
  });

  return {
    messages: result.messages,
  };
};

// StateGraph
const graph = new StateGraph({
  state: OverallStage,
  input: InputState,
  output: OutputState,
})
  .addNode("agent", agentNode)
  .addEdge(START, "agent")
  .addEdge("agent", END)
  .compile({
    checkpointer, // ✅ Postgres
  });

//call agent
export async function callAgent(options: {
  input: {
    messages: BaseMessage[];
  };
  config: LangGraphRunnableConfig & {
    configurable: {
      thread_id: string;
    };
  };
}) {
  // Map BaseMessage types to schema roles
  const mapMessageRole = (
    type: string
  ): "user" | "assistant" | "system" | "tool" => {
    const typeMap: Record<string, "user" | "assistant" | "system" | "tool"> = {
      human: "user",
      ai: "assistant",
      system: "system",
      tool: "tool",
      HumanMessage: "user",
      AIMessage: "assistant",
      SystemMessage: "system",
      ToolMessage: "tool",
    };
    return typeMap[type.toLowerCase()] ?? "user";
  };

  const stream = await graph.stream(
    {
      thread_id: options.config.configurable.thread_id,
      messages: options.input.messages.map((msg) => ({
        role: mapMessageRole(msg.type),
        content:
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content),
      })),
    },
    {
      configurable: {
        thread_id: options.config.configurable.thread_id,
      },
      streamMode: "values",
      recursionLimit: 10,
    }
  );

  return stream;
}
