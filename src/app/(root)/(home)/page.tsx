import { prisma } from "@/db/client";
import Link from "next/link";
export default async function Home() {
  //TODO: fix history not show problem
  const records = await prisma.record.findMany();
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <Link href={`/recordings/${record.id}/chat`} key={record.id}>
          <div>
            <h1>{record.title}</h1>
            <p>{record.duration}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
