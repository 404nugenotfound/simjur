import Sidebar from "../components/Sidebar";
import HeaderBar from "../components/Headerbar";
import Footer from "../components/Footer";
import { useState } from "react";

type LayoutProps = {
  hideHeader?: boolean;
  children:
    | React.ReactNode
    | ((mode: "list" | "TOR" | "LPJ", setMode: (m: "list" | "TOR" | "LPJ") => void) => React.ReactNode);
};

export default function Layout({ children, hideHeader }: LayoutProps) {
  const [mode, setMode] = useState<"list" | "TOR" | "LPJ">("list") ;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar setMode={setMode} />

      <div className="flex-1 flex flex-col">
        {!hideHeader && <HeaderBar />}
        <main className="overflow-y-auto flex-1">
          {typeof children === "function" ? children(mode, setMode) : children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
