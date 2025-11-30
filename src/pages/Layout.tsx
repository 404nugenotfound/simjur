import Sidebar from "../components/Sidebar";
import HeaderBar from "../components/Headerbar";
import { useState } from "react";

type LayoutProps = {
  children:
    | React.ReactNode
    | ((mode: "list" | "form", setMode: (m: "list" | "form") => void) => React.ReactNode);
};

export default function Layout({ children }: LayoutProps) {
  const [mode, setMode] = useState<"list" | "form">("list");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar setMode={setMode} />

      <div className="flex-1 flex flex-col">
        <HeaderBar />
        <main className="p-6 overflow-y-auto flex-1">
          {typeof children === "function" ? children(mode, setMode) : children}
        </main>
      </div>
    </div>
  );
}
