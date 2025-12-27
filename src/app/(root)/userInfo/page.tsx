"use server";

import { auth } from "@/lib/auth/auth-node";
import Image from "next/image";

const page = async () => {
  const session = await auth();
  return (
    <div>
      <div className="w-fit rounded-full bg-primary/20">
        {!session?.user?.image && (
          <p className="size-12">
            {session?.user?.name?.charAt(0).toUpperCase()}
          </p>
        )}
        {session?.user?.image && (
          <Image
            src={session?.user?.image}
            width={48}
            height={48}
            alt={session.user.name ?? "Avatar"}
            className="rounded-full"
          />
        )}
      </div>
      <p>{session?.user?.name}</p>
      <p>{session?.user?.email}</p>
    </div>
  );
};

export default page;
