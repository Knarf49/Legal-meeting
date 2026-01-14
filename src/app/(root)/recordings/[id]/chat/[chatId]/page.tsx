import ChatWindow from "@/components/Chat/ChatWindow";
import { prisma } from "@/db/client";
import { auth } from "@/lib/auth/auth-node";

export default async function ChatPage({
  params,
}: {
  params: { chatId: string };
}) {
  const { chatId } = await params;

  const session = await auth();
  if (!session?.user?.email) {
    return <p>User not found!</p>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return <p>User not found!</p>;
  }

  // ✅ หา chat ผ่าน RecordChat และเช็ค ownership
  const recordChat = await prisma.recordChat.findFirst({
    where: {
      chatId,
      record: {
        userId: user.id,
      },
    },
    include: {
      chat: {
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!recordChat) {
    return <p>Chat Not Found!</p>;
  }

  return <ChatWindow chatId={chatId} />;
}
