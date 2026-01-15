import { prisma } from "@/db/client";
import { auth } from "@/lib/auth/auth-node";
import { createChatWithRecord, getUserChats } from "@/lib/chatHistory";
import { NextRequest, NextResponse } from "next/server";

//TODO: fix GET 404 not found
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const chats = await getUserChats(session.user.id as string, limit);

    return NextResponse.json({
      success: true,
      data: chats,
    });
  } catch (err) {
    console.log(err)
    return NextResponse.json(
      { success: false, error: "Failed to get chats" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { recordId } = await req.json();

    if (!recordId) {
      return NextResponse.json(
        { error: "recordId is required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า record เป็นของ user นี้
    const record = await prisma.record.findFirst({
      where: {
        id: recordId,
        userId: user.id,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Record not found or access denied" },
        { status: 404 }
      );
    }

    // สร้าง chat ใหม่
    const chat = await createChatWithRecord(recordId, "New Chat");

    return NextResponse.json({
      success: true,
      chatId: chat.id,
    });
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
