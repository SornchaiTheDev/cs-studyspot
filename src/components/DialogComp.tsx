import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LucideProps, Trash } from "lucide-react";
import React, {
  ForwardRefExoticComponent,
  RefAttributes,
  useState,
} from "react";

interface Props {
  buttonName: string;
  topic: string;
  description: string;
  icon?: React.ReactNode;
  // onclick: () => void;
  onAcceptState: () => void;
}

export default function DialogDemo({
  buttonName,
  topic,
  description,
  icon,
  // onclick,
  onAcceptState,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          //   onClick={onClick}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-10 h-10"
        >
          {icon}
          <h6 className="font-medium text-lg">{buttonName}</h6>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{topic}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <button onClick={() => setIsOpen(false)} type="submit">
            ยกเลิก
          </button>
          <button
            onClick={() => {
              onAcceptState;
              setIsOpen(false);
            }}
            type="submit"
          >
            ยืนยัน
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
