"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Copy, LucideIcon } from "lucide-react";

//TODO: fix meeting card Icon image's src prop into lucide-react
interface MeetingCardProps {
  title: string;
  date: string;
  icon: LucideIcon;
  isPreviousMeeting?: boolean;
  buttonIcon1?: LucideIcon;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  title,
  date,
  icon: Icon,
  isPreviousMeeting,
  buttonIcon1: ButtonIcon,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  return (
    <section className="flex min-h-64.5 w-full flex-col justify-between rounded-xl px-5 py-8 xl:max-w-142 border-2 border-primary/60">
      <article className="flex flex-col gap-5">
        <Icon className="size-7" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-base font-normal">{date}</p>
        </div>
      </article>

      {!isPreviousMeeting && (
        <div className="flex justify-center gap-2">
          <Button onClick={handleClick} className="rounded-lg px-6">
            {ButtonIcon && <ButtonIcon className="mr-2 size-4" />}
            {buttonText}
          </Button>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Link Copied");
            }}
            className="px-6 rounded-lg"
          >
            <Copy className="mr-2 size-4" />
            Copy Link
          </Button>
        </div>
      )}
    </section>
  );
};

export default MeetingCard;
