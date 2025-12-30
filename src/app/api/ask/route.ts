import { NextRequest, NextResponse } from "next/server";
import { agent } from "@/lib/agent";
import { randomUUID } from "crypto";
import { HumanMessage } from "langchain";
//TODO: fix Missing required parameter: 'messages[3].content[0].type'c
export async function POST(req: NextRequest) {
  try {
    const { question, threadId } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    const result = await agent.invoke(
      {
        messages: [new HumanMessage(question)],
      },
      {
        configurable: {
          thread_id: threadId ?? randomUUID(),
        },
      }
    );

    const lastMessage = result.messages.at(-1);

    const answer =
      typeof lastMessage?.content === "string"
        ? lastMessage.content
        : Array.isArray(lastMessage?.content)
        ? lastMessage.content.map((c) => c.text).join("")
        : "";

    return NextResponse.json({
      question,
      answer,
      thread_id: threadId,
    });
  } catch (error) {
    console.error("❌ /ask error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
