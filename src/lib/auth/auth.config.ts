import { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

//TODO: fix password type error
export const authConfig = {
  providers: [Google],
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
