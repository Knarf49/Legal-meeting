"use client";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useState } from "react";
import Loader from "@/components/Loader";
import MeetingRoom from "@/components/meeting/MeetingRoom";
import MeetingSetup from "@/components/meeting/MeetingSetup";
import { useGetCallById } from "@/hooks/useGetCallById";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { CircleX } from "lucide-react";

const MeetingPage = () => {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { call, isCallLoading } = useGetCallById(id as string);

  if (status === "loading" || isCallLoading) return <Loader />;

  if (!call)
    return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );

  const notAllowed =
    call.type === "invited" &&
    (!user || !call.state.members.find((m) => m.user.id === user.id));

  if (notAllowed)
    return (
      <Alert>
        <CircleX />
        <AlertTitle>You are not allowed to join this meeting</AlertTitle>
      </Alert>
    );

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
