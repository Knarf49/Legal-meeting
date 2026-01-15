import ChatWindow from "@/components/Chat/ChatWindow";
import { getChatInitialValues } from "@/lib/chatHistory";
import { toast } from "react-toastify";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  const initialValues = await getChatInitialValues(chatId);

  if (!initialValues) toast.error("Cannot fetch chat history");
  return <ChatWindow chatId={chatId} initialValues={initialValues} />;
}
