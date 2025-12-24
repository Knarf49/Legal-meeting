"use server";

import { auth } from "../auth/auth-node";
import { StreamClient } from "@stream-io/node-sdk";
export const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
const apiSecret = process.env.STREAM_SECRET_KEY as string;

export const tokenProvider = async () => {
  const session = await auth();
  const user = session?.user;
  const id = user?.id;

  if (!user) throw new Error("User is not logged in");

  const client = new StreamClient(apiKey, apiSecret);

  const exp = 60 * 60;

  const token = client.generateUserToken({
    user_id: id as string,
    validity_in_seconds: exp,
  });
  console.log("GENERATED TOKEN:", token);
  return token;
};
