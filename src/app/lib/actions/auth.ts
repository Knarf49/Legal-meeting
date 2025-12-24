"use server";

import { prisma } from "@/db/client";
import { signIn, signOut } from "@/lib/auth/auth-node";
import bcrypt from "bcryptjs";

export const googleLogin = async () => {
  await signIn("google", { redirectTo: "/" });
};

type SignupResult = { ok: true } | { ok: false; error: string };

export async function SignupWithCredentials(
  email: string,
  password: string,
  name: string
): Promise<SignupResult> {
  // 1. validate
  if (!email) {
    return { ok: false, error: "Missing email" };
  }
  if (!password) {
    return { ok: false, error: "Missing password" };
  }
  if (!name) {
    return { ok: false, error: "Missing name" };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password ต้องอย่างน้อย 8 ตัวอักษร" };
  }

  // 2. check user ซ้ำ
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { ok: false, error: "Email นี้ถูกใช้งานแล้ว" };
  }

  // 3. hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // 4. create user + credential (transaction)
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name,
      },
    });

    await tx.credential.create({
      data: {
        userId: user.id,
        passwordHash,
      },
    });
  });

  return { ok: true };
}

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};
