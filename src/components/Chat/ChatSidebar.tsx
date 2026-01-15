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
import { auth } from "@/lib/auth/auth-node";
import Link from "next/link";
import { CreateChatBtn } from "./CreateChatBtn";
import { getRecordChats } from "@/lib/chatHistory";

export default async function ChatSidebar({ recordId }: { recordId: string }) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const recordChats = await getRecordChats(recordId, session.user.id as string);

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
              {recordChats.length === 0 ? (
                <span>Not have any chat yet.</span>
              ) : (
                recordChats.map(({ chat }) => (
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
