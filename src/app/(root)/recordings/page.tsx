// import CallList from "@/components/CallList";

import AddRecordBtn from "@/components/AddRecordBtn";
import { prisma } from "@/db/client";
import { auth } from "@/lib/auth/auth-node";
import Link from "next/link";
//TODO: change layout
//fetch all records voice
const RecordsPage = async () => {
  const session = await auth();

  if (!session?.user?.email) return <p>Please login first</p>;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return <p>User not found</p>;

  const records = await prisma.record.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="flex flex-col w-full gap-10 text-white pl-4">
      <h1 className="text-3xl font-bold text-primary">Recordings</h1>
      <AddRecordBtn />
      {records.length === 0 ? (
        <p className="text-gray-400">Not have any record yet</p>
      ) : (
        <ul className="space-y-3">
          {records.map((record) => (
            <Link href={`/recordings/${record.id}/chat`} key={record.id}>
              <li
                key={record.id}
                className="rounded-lg border p-4 hover:bg-muted transition"
              >
                <h2 className="font-semibold text-primary">{record.title}</h2>

                {record.recordPath && (
                  <p className="text-sm text-gray-500">
                    Path: {record.recordPath}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  {record.createdAt.toLocaleString()}
                </p>
              </li>
            </Link>
          ))}
        </ul>
      )}
      {/* <CallList type="recordings" /> */}
    </section>
  );
};

export default RecordsPage;
