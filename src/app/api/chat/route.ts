import { prisma } from "@/db/client";
import { auth } from "@/lib/auth/auth-node";
import { NextResponse } from "next/server";
//TODO: fix GET 404 not found
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recordId } = await req.json();

  if (!recordId) {
    return NextResponse.json({ error: "recordId required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // (optional) check record ownership
  const record = await prisma.record.findFirst({
    where: {
      id: recordId,
      userId: user.id,
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  const chat = await prisma.chat.create({
    data: {
      title: "New chat",
      records: {
        create: {
          recordId: record.id,
        },
      },
    },
  });

  return NextResponse.json({ chatId: chat.id });
}