import { callAgent } from "@/lib/agent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const messages = body.input?.messages;
    const chatId = body.input?.configurable?.thread_id;
    // console.log("BODY:", JSON.stringify(body, null, 2));

    const lastUserMessage = messages[messages.length - 1];
    if (!body) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    return callAgent(body);
  } catch (error) {
    console.error("❌ /ask error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
