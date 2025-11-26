import Logo from "../assets/LogoWhite.svg";
import Profile from "../assets/2X.svg";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import {
  ChartBarIcon,
  DocumentTextIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleMenuClick = (path: string) => {
    if (!open) setOpen(true);
    navigate(path);
  };

  // Close dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside
        className={`bg-gradient text-white p-4 pr-6 transition-all duration-300 flex flex-col ${
          open ? "w-80" : "w-20"
        }`}
      >
        {/* Header Logo & Toggle */}
        <div className="flex items-center justify-between mb-16 pr-1 ">
          <div className="flex items-center gap-[-2.5rem]">
            {open && (
              <>
                <img src={Logo} alt="SIMJUR" className="w-[60px] ml-2" />
                <h1
                  className="ml-1 text-lg font-orbitron font-extrabold 
                tracking-[0.5rem] pointer-events-none"
                >
                  SIMJUR
                </h1>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="text-white"
            aria-label="Zoom Menu"
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
        </div>

        {/* Menu Title */}
        <h2
          className={`text-gray-300 font-bebas uppercase tracking-[0.2rem] 
            mb-7 mr-[22rem] text-center transition-all pointer-events-none duration-300 pl-1   ${
              open ? "text-xl opacity-100" : "text-sm opacity-70"
            }`}
        >
          Menu
        </h2>

        {/* Navigation */}
        <nav className={`space-y-3 ml-[-1rem] pl-5`}>
          <a
            onClick={() => handleMenuClick("/User#")}
            href="#"
            className={`flex items-center gap-3 text-lg px-4 py-3 rounded-md transition-all cursor-pointer
            ${!open && "justify-center"}
            hover:bg-black/20`}
          >
            <ChartBarIcon className="w-6 h-6 min-w-[24px] " />
            {open && <span>Dashboard</span>}
          </a>

            <a
              onClick={() => handleMenuClick("/User#")}
              href="#"
              className={`flex items-center gap-3 text-lg px-4 py-3 rounded-md transition-all cursor-pointer
              ${!open && "justify-center"}
              hover:bg-black/20`}
              >
              <DocumentTextIcon className="w-6 h-6 min-w-[24px]" />
              {open && <span>Pengajuan Kegiatan</span>}
            </a>
        </nav>
      </aside>

      {/* Right Side Content */}
      <div className="relative flex-1 flex flex-col cursor-pointer select-none min-h-screen">
        <header className="flex items-center justify-between bg-white shadow">
          <div></div>
          <div
            className="
            relative flex items-center gap-3 cursor-pointer 
            px-5 py-5 
            border border-transparent 
            hover:border-gray-300 hover:bg-gray-100 transition
            "
            onClick={() => setOpenDropdown(!openDropdown)}
          >
            {/* Separator */}
            <div className="absolute left-[-0.2rem] top-0 bottom-0 w-[2px] bg-gray-300"></div>

            {/* Foto */}
            <img src={Profile} alt="user" className="w-10 h-10 ml-2 rounded-full" />

            {/* Nama */}
            <span className="font-semibold text-black max-w-[200px] pl-1 truncate">
              MUHAMMAD RANGGA FABIANO
            </span>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
      {openDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-6 top-16 bg-white shadow-lg rounded-md w-40 py-2 z-50"
        >
          <button
            className="w-full text-left text-black px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setOpenDropdown(false);
              console.log("Go to Profile");
            }}
          >
            Profile
          </button>

          <button
            className="w-full text-left text-black px-4 py-2 hover:bg-gray-100 text-red-500"
            onClick={() => {
              setOpenDropdown(false);
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
