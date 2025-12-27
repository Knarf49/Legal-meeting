"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, Calendar, Video, User } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const pathname = usePathname();

  const sidebarLinks = [
    {
      label: "Home",
      route: "/",
      icon: Home,
    },
    {
      label: "Upcoming",
      route: "/upcoming",
      icon: Calendar,
    },
    {
      label: "Previous",
      route: "/previous",
      icon: Video,
    },
    {
      label: "Personal Room",
      route: "/personalRoom",
      icon: User,
    },
  ];

  return (
    <section className="w-full max-w-66">
      <Sheet>
        <SheetTrigger asChild>
          {/* Hamburger */}
          <Menu className="size-8 cursor-pointer sm:hidden" />
        </SheetTrigger>
        <SheetContent side="left" className="border-none px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <p className="text-[26px] font-extrabold pl-4 py-6">Meeting</p>
          </Link>

          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <section className="flex h-full flex-col gap-6">
                {sidebarLinks.map((item) => {
                  const isActive = pathname === item.route;
                  const Icon = item.icon;

                  return (
                    <SheetClose asChild key={item.route}>
                      <Link
                        href={item.route}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg w-full max-w-60 transition-colors duration-300 hover:bg-primary/10",
                          {
                            "bg-blue-1": isActive,
                          }
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <p className="font-semibold">{item.label}</p>
                      </Link>
                    </SheetClose>
                  );
                })}
              </section>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
