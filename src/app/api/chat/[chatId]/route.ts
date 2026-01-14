import { prisma } from "@/db/client";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  // Await params before using
  const { chatId } = await params;

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}
