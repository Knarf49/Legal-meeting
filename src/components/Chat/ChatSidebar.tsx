import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { prisma } from "@/db/client";
import { auth } from "@/lib/auth/auth-node";
import Link from "next/link";
import { CreateChatBtn } from "./CreateChatBtn";

export default async function ChatSidebar({ recordId }: { recordId: string }) {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;

  const chats = await prisma.recordChat.findMany({
    where: {
      recordId,
      record: {
        userId: user.id, // กัน record ของคนอื่น
      },
    },
    include: {
      chat: true,
    },
    orderBy: {
      chat: {
        updatedAt: "desc",
      },
    },
  });

  return (
    <Sidebar>
      <SidebarHeader className="text-2xl mt-24 pl-6">History</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <CreateChatBtn recordId={recordId} />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent className="pl-4 pt-6">
            <SidebarMenu>
              {chats.length === 0 ? (
                <span>Not have any chat yet.</span>
              ) : (
                chats.map(({ chat }) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild>
                      <Link href={`/recordings/${recordId}/chat/${chat.id}`}>
                        <span>{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
