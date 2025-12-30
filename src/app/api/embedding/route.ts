//TODO: implement embedding function from pdf's text chunk
import type { NextApiRequest, NextApiResponse } from "next";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { PineconeStore } from "@langchain/pinecone";
// import { embeddings, pinecone } from "@/lib/agent";

//TODO: add pdf as input
type ResponseData = {
  message: string;
};

//TODO: แก้ให้ตอน upload แล้วสร้าง db อันใหม่โดยมี index คือ law-date()
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    //   const { url } = req.body;
    //   const loader = new CheerioWebBaseLoader(url);
    //   const docs = await loader.load();

    //   const textSplitter = new RecursiveCharacterTextSplitter({
    //     chunkSize: 500,
    //     chunkOverlap: 200,
    //   });

    //   const allSplits = await textSplitter.splitDocuments(docs);

    //   const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

    //   const vectorStore = new PineconeStore(embeddings, {
    //     pineconeIndex,
    //     maxConcurrency: 5,
    //   });

    //   await vectorStore.addDocuments(allSplits);
    //   console.log("finish indexing...");
    res.status(200).json({ message: "finish indexing..." });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
