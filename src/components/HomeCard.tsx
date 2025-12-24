"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
}

const HomeCard = ({ className, img, title, description }: HomeCardProps) => {
  return (
    <section
      className={cn(
        "bg-orange-1 px-4 py-6 flex flex-col justify-between w-full xl:max-w-67.5 min-h-65 rounded-[14px] cursor-pointer",
        className
      )}
    >
      <div className="flex-cener glassmorphism size-12 rounded-[10px]">
        <Image src={img} alt="meeting" width={27} height={27} />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-lg font-normal">{description}</p>
      </div>
    </section>
  );
};

export default HomeCard;
