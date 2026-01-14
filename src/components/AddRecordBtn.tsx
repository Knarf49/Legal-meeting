"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function AddRecordBtn() {
  const router = useRouter();
  async function handleSubmit() {
    await fetch("/api/record", { method: "POST" });
    router.refresh();
  }

  return <Button onClick={() => handleSubmit()}>+ New Record</Button>;
}
