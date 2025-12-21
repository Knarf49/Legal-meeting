"use server";

import { auth } from "@/lib/auth/auth-node";
import SignInButton from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  return (
    <div>
      <p>
        {session?.user
          ? `Welcome ${session.user.name}`
          : "You are not signed in"}
      </p>
      {session?.user && (
        <Link href="/userInfo">
          <Button>See more Info</Button>
        </Link>
      )}

      {session?.user ? <SignOutButton /> : <SignInButton />}
    </div>
  );
}
