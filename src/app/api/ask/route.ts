import { callAgent } from "@/lib/agent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // console.log("BODY:", JSON.stringify(body, null, 2));

    // Extract from LangGraph SDK format
    const input = body.input;
    const threadId =
      body.config?.configurable?.thread_id ||
      body.input?.configurable?.thread_id;

    if (!input || !input.messages || !threadId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: input.messages and config.configurable.thread_id",
        },
        { status: 400 }
      );
    }

    // Call agent with properly structured input
    const result = await callAgent({
      input: {
        messages: input.messages,
      },
      config: {
        configurable: {
          thread_id: threadId,
        },
      },
    });

    // Consume the stream and return as JSON
    const chunks = [];
    for await (const chunk of result) {
      chunks.push(chunk);
    }

    return NextResponse.json(chunks);
  } catch (error) {
    console.error("❌ /ask error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
