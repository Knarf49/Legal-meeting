import { TavilySearch } from "@langchain/tavily";

export const tavilyTool = new TavilySearch({
  tavilyApiKey: process.env.TAVILY_API_KEY,
  maxResults: 5,
  description: `
    ใช้สำหรับค้นหาข้อมูลกฎหมายเพิ่มเติมจากอินเทอร์เน็ต
    เช่น:
    - กฎหมายใหม่
    - พระราชบัญญัติ
    - ระเบียบราชการ
    - คำอธิบายกฎหมาย
    ใช้เฉพาะเมื่อ context จากฐานข้อมูลไม่เพียงพอ
    `,
});
