"use client";

import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { tokenProvider } from "@/lib/actions/stream.actions";
import Loader from "@/components/Loader";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [client, setClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!user) {
      // ถ้า logout → clear client
      setClient(null);
      return;
    }

    if (!API_KEY) throw new Error("Stream API key is missing");

    console.log(user.id);
    const videoClient = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user.id as string,
        name: user.name || user.email || "User",
        image: user.image as string,
      },
      tokenProvider,
    });

    setClient(videoClient);

    return () => {
      videoClient.disconnectUser();
    };
  }, [user]);

  if (status === "loading") {
    return <Loader />;
  }

  if (!user) {
    return <>{children}</>;
  }

  if (!client) {
    return <Loader />;
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
