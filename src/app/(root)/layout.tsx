import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <Navbar />
      <section className="pt-24 container mx-auto">{children}</section>
    </main>
  );
};

export default RootLayout;
