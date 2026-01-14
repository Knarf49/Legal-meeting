import { prisma } from "@/db/client";
import { auth } from "@/lib/auth/auth-node";
import { NextResponse } from "next/server";

export async function POST() {
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

  const count = await prisma.record.count({
    where: { userId: user.id },
  });

  const record = await prisma.record.create({
    data: {
      title: `record_${count + 1}`,
      userId: user.id,
      recordPath: "/abc",
      duration: 200,
    },
  });

  return NextResponse.json(record);
}
