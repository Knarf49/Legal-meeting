"use client";
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  instantMeeting?: boolean;
  icon?: LucideIcon;
  buttonIcon?: LucideIcon;
  buttonClassName?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  icon: Icon,
  buttonIcon: ButtonIcon,
  buttonClassName,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-130 flex-col gap-6 border-none px-6 py-9">
        <div className="flex flex-col gap-6">
          {Icon && (
            <div className="flex justify-center">
              <Icon className="size-18 text-blue-1" />
            </div>
          )}

          <DialogTitle className={className}>{title}</DialogTitle>

          {children}

          <Button
            className={`focus-visible:ring-0 focus-visible:ring-offset-0 ${
              buttonClassName ?? ""
            }`}
            onClick={handleClick}
          >
            {ButtonIcon && <ButtonIcon className="mr-2 size-4" />}
            {buttonText || "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
