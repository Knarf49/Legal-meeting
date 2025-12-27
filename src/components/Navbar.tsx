"use client";
import Link from "next/link";
import MobileNav from "@/components/mobileNav";
import { Calendar, CircleUser, Home, User, Video } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { logout } from "@/app/lib/actions/auth";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const session = useSession();
  const user = session?.data?.user;
  const navLinks = [
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
    <nav className="flex justify-between items-center shadow-md fixed z-50 w-full px-6 py-4 lg:px-10 bg-secondary">
      <Link href="/" className="flex items-center">
        <Video />
        <p className="ml-4 text-[26px] font-extrabold text-primary">Meeting</p>
      </Link>

      <div className="gap-x-12 hidden md:flex">
        {navLinks.map(({ label, route, icon: Icon }) => (
          <Link href={route} key={label}>
            <Icon className="size-6" />
          </Link>
        ))}
      </div>

      {user ? (
        <div className="items-center gap-3 hidden md:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted overflow-hidden">
            {user.image ? (
              <Image
                src={user.image}
                width={48}
                height={48}
                alt="profile_img"
                className="h-full w-full object-cover"
              />
            ) : (
              <CircleUser className="size-8" />
            )}
          </div>

          <Button onClick={() => logout()}>Logout</Button>
        </div>
      ) : (
        <Button asChild className="hidden md:flex">
          <Link href="/signup">SignUp</Link>
        </Button>
      )}

      <div className="block md:hidden">
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
