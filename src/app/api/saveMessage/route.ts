import { prisma } from "@/db/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { chatId, content } = await req.json();

  if (!chatId || !content) {
    return NextResponse.json(
      { error: "chatId and content required" },
      { status: 400 }
    );
  }

  await prisma.message.create({
    data: {
      chatId,
      role: "assistant",
      content,
    },
  });

  return NextResponse.json({ ok: true });
}
