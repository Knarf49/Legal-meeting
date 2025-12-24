//TODO: add password into user table as hash
import { prisma } from "@/db/client";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      credentials: true,
      accounts: true,
    },
  });
}
