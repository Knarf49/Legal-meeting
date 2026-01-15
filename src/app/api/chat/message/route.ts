import { auth } from "@/lib/auth/auth-node";
import { addMessageToChat, updateChatTitle } from "@/lib/chatHistory";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { chatId, role, content, updateTitle } = await req.json();

    if (!chatId || !role || !content) {
      return NextResponse.json({
        error: "ChatId, role,and content are required",
      });
    }

    const message = await addMessageToChat(chatId, role, content);
    //update title
    if (updateTitle) await updateChatTitle(chatId);

    return NextResponse.json({
      success: true,
      messageId: message.id,
    });
  } catch (err) {
    console.error("Save message error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save message" },
      { status: 500 }
    );
  }
}
