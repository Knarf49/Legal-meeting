import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { vectorStore } from "../agent";

export const vector_search = tool(
  async ({ query, k }) => {
    const results = await vectorStore.similaritySearch(query, k ?? 5);

    console.log("🔍 query:", query);
    console.log("📦 results:", results);

    if (!results.length) {
      return "ไม่พบข้อมูลที่เกี่ยวข้องในฐานความรู้";
    }

    return results
      .map((doc, i) => {
        const path = doc.metadata?.path ?? "ไม่ระบุ path";
        const nodeId = doc.metadata?.node_id ?? "ไม่ระบุ node_id";

        return `
เอกสารลำดับที่ ${i + 1}
${doc.pageContent}

[อ้างอิง: ${path} | node_id: ${nodeId}]
        `.trim();
      })
      .join("\n\n--------------------\n\n");
  },
  {
    name: "vector_search",
    description: `
ใช้ค้นหาข้อมูลกฎหมายจาก Vector Database
ควรใช้ทุกครั้งก่อนตอบคำถามด้านกฎหมาย
ผลลัพธ์จะเป็นข้อความกฎหมายพร้อมแหล่งอ้างอิง
`,
    schema: z.object({
      query: z.string().describe("คำถามหรือข้อความที่ต้องการค้นหา"),
      k: z.number().optional().describe("จำนวนผลลัพธ์ที่ต้องการ (default = 5)"),
    }),
  }
);
