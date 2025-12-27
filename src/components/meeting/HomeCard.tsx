import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HomeCardProps {
  className?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  handleClick?: () => void;
}

export const HomeCard = ({
  className,
  icon: Icon,
  title,
  description,
  handleClick,
}: HomeCardProps) => {
  return (
    <section
      className={cn(
        "bg-orange-1 px-4 py-6 flex flex-col justify-between w-full xl:max-w-67.5 min-h-65 rounded-[14px] cursor-pointer border bg-secondary",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-center glassmorphism size-12 rounded-[10px]">
        <Icon className="size-7" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-lg font-normal">{description}</p>
      </div>
    </section>
  );
};
