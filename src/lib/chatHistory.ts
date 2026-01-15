import { prisma } from "@/db/client";

export interface ChatHistoryMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp?: Date;
}

export interface ThreadHistory {
  thread_id: string;
  messages: ChatHistoryMessage[];
  created_at: Date;
  updated_at: Date;
}

//update chat title
export async function updateChatTitle(chatId: string) {
  const firstUserMessage = await prisma.message.findFirst({
    where: {
      chatId,
      role: "user",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (firstUserMessage) {
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        title: firstUserMessage.content.substring(0, 100),
      },
    });
  }
}

/**
 * ดึง checkpoint history ของ thread (จาก LangGraph)
 */
export async function getThreadHistory(
  threadId: string
): Promise<ThreadHistory | null> {
  const checkpoints = await prisma.checkpoints.findMany({
    where: {
      thread_id: threadId,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  if (checkpoints.length === 0) {
    return null;
  }

  const latestCheckpoint = checkpoints[checkpoints.length - 1];
  const state = latestCheckpoint.checkpoint as any;

  return {
    thread_id: threadId,
    messages: state.messages || [],
    created_at: checkpoints[0].created_at,
    updated_at: latestCheckpoint.created_at,
  };
}

export async function getChatMessages(chatId: string) {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  // แปลง Prisma messages → LangChain format
  return messages.map((msg) => ({
    type:
      msg.role === "user" ? "human" : msg.role === "assistant" ? "ai" : "tool",
    content: msg.content,
  }));
}

export async function getChatInitialValues(chatId: string) {
  const chat = await getChatWithMessages(chatId);

  if (!chat) {
    return null;
  }

  // แปลง Prisma messages → LangChain format สำหรับ initialValues
  const messages = chat.messages.map((msg) => ({
    type:
      msg.role === "user" ? "human" : msg.role === "assistant" ? "ai" : "tool",
    content: msg.content,
  }));

  return {
    messages,
  };
}

/**
 * ดึง Chat พร้อม Messages จาก Prisma model
 */
export async function getChatWithMessages(chatId: string) {
  return await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      records: {
        include: {
          record: true,
        },
      },
    },
  });
}

/**
 * ดึงรายการ chats ทั้งหมดของ user
 */
export async function getUserChats(userId: string, limit: number = 50) {
  // ดึง chats ที่เชื่อมกับ records ของ user
  return await prisma.chat.findMany({
    where: {
      records: {
        some: {
          record: {
            userId: userId,
          },
        },
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // เอาแค่ข้อความล่าสุด
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });
}

/**
 * สร้าง Chat ใหม่พร้อมเชื่อมกับ Record
 */
export async function createChatWithRecord(recordId: string, title?: string) {
  return await prisma.chat.create({
    data: {
      title: title || "New Chat",
      records: {
        create: {
          recordId: recordId,
        },
      },
    },
  });
}

export async function getRecordChats(recordId: string, userId: string) {
  return await prisma.recordChat.findMany({
    where: {
      recordId,
      record: {
        userId, // security check
      },
    },
    include: {
      chat: {
        include: {
          _count: {
            select: { messages: true },
          },
        },
      },
    },
    orderBy: {
      chat: {
        updatedAt: "desc",
      },
    },
  });
}

/**
 * เพิ่ม message เข้า chat
 */
export async function addMessageToChat(
  chatId: string,
  role: "user" | "assistant" | "tool",
  content: string,
  metadata?: any
) {
  return await prisma.message.create({
    data: {
      chatId,
      role,
      content,
      metadata,
    },
  });
}

/**
 * Update streaming message
 */
export async function updateStreamingMessage(
  messageId: string,
  content: string,
  isStreaming: boolean = false
) {
  return await prisma.message.update({
    where: { id: messageId },
    data: {
      content,
      isStreaming,
    },
  });
}

/**
 * ลบ chat และ messages ทั้งหมด
 */
export async function deleteChat(chatId: string) {
  return await prisma.chat.delete({
    where: { id: chatId },
  });
}

/**
 * ลบ thread checkpoint (LangGraph)
 */
export async function deleteThreadCheckpoint(threadId: string) {
  await prisma.$transaction([
    prisma.checkpoints_writes.deleteMany({
      where: { thread_id: threadId },
    }),
    prisma.checkpoints.deleteMany({
      where: { thread_id: threadId },
    }),
  ]);
}

/**
 * Sync checkpoint messages → Prisma Chat
 * (ใช้เมื่อต้องการ sync ข้อมูลจาก LangGraph → Prisma)
 */
export async function syncThreadToChat(threadId: string, chatId: string) {
  const threadHistory = await getThreadHistory(threadId);

  if (!threadHistory) {
    throw new Error("Thread not found");
  }

  // ลบ messages เก่าก่อน (ถ้ามี)
  await prisma.message.deleteMany({
    where: { chatId },
  });

  // สร้าง messages ใหม่
  const messages = threadHistory.messages
    .filter((msg) => msg.role !== "system")
    .map((msg, index) => ({
      chatId,
      role: msg.role as "user" | "assistant" | "tool",
      content: msg.content,
      createdAt: new Date(threadHistory.created_at.getTime() + index * 1000),
    }));

  await prisma.message.createMany({
    data: messages,
  });

  // Update chat title ถ้ายังไม่มี
  const firstUserMsg = threadHistory.messages.find((m) => m.role === "user");
  if (firstUserMsg) {
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        title: firstUserMsg.content.substring(0, 100),
      },
    });
  }
}
