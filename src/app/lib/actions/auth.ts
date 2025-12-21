"use server";

import { signIn, signOut } from "@/lib/auth/auth-node";

export const login = async () => {
  await signIn("google", { redirectTo: "/" });
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};
