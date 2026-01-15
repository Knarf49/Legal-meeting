"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export function CreateChatBtn({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recordId }),
      });
      if (!res.ok) throw new Error("Failed to create chat");
      const data = await res.json();

      if (data.chatId) {
        router.push(`/recordings/${recordId}/chat/${data.chatId}`);
        router.refresh();
      }
    } catch (err) {
      toast.error("Create chat failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={loading}
      className="w-full justify-start gap-2"
      variant="ghost"
    >
      <Plus className="w-4 h-4" />
      {loading ? "Creating..." : "New Chat"}
    </Button>
  );
}
