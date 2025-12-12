import Logo from "../assets/LogoWhite.svg";
import {
  ChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ChevronDownIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Sidebar({
  setMode,
}: {
  setMode: (m: "list" | "TOR" | "LPJ") => void;
}) {
  const navigate = useNavigate();
  const kegiatanRef = useRef<HTMLDivElement | null>(null);
  const kelolaRef = useRef<HTMLDivElement>(null);
  const [dropdownState, setDropdown] = useState({
    kelola: false,
    kegiatan: false,
  });
  const [open, setOpen] = useState(true);
  const [openClick, setOpenClick] = useState(false); // state mental untuk toggle dropdown
  
  const role = localStorage.getItem("role"); 

  const toggleDropdown = (type: "kegiatan" | "kelola") => {
    setDropdown((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (
        (!kegiatanRef.current || !kegiatanRef.current.contains(target)) &&
        (!kelolaRef.current || !kelolaRef.current.contains(target))
      ) {
        setDropdown({ kelola: false, kegiatan: false });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (path: string) => {
  navigate(path); // navigasi aja, tanpa ubah open
};

  return (
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
      <nav className="space-y-3 ml-[-1rem] pl-5">
       {/* Dashboard */}
       <a
          onClick={() => {
            setOpenClick(!openClick);
            navigate("/dashboard");
          }}
          className={`flex items-center gap-3 text-lg px-4 py-3 rounded-md transition-all cursor-pointer 
          ${!open ? "justify-center" : "justify-start"} hover:bg-black/20`}
        >
          <ChartBarIcon className="w-6 h-6 min-w-[24px]" />
          {open && <span>Dashboard</span>}
        </a>

        {/* ====================== SEKJUR: KELOLA DASHBOARD ====================== */}
        {role === "Admin" && (
          <div className="relative" ref={kelolaRef}>
            <button
              onClick={() => {
                if (!open) {
                  setOpen(true);
                  setDropdown({ ...dropdownState, kelola: true });
                  return;
                }
                toggleDropdown("kelola");
              }}
              className={`flex items-center gap-3 text-lg px-4 py-3 rounded-md transition-all cursor-pointer 
                ${!open && "justify-center"} hover:bg-black/20 w-full`}
            >
              <Cog6ToothIcon className="w-6 h-6 min-w-[24px]" />
              {open && (
                <span className="flex items-center gap-[2.4rem]">
                  Kelola Dashboard
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`w-5 h-5 transition-transform ${
                      dropdownState.kelola ? "rotate-180" : ""
                    }`}
                  />
                </span>
              )}
            </button>

            {open && dropdownState.kelola && (
              <div className="bg-gradient-to-b from-[#0F2A4A] to-[#0B614C] text-white shadow-lg rounded-md py-2 w-full border border-white/10">
                <button
                  onClick={() => navigate("/kelola")}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 w-full"
                >
                  <CreditCardIcon className="w-5 h-5" />
                  Update Dana
                </button>

                <button
                  onClick={() => navigate("/Input")}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 w-full"
                >
                  <BanknotesIcon className="w-5 h-5" />
                  Input Dana
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================== PENGAJU: PENGAJUAN KEGIATAN ====================== */}
        {role === "Pengaju" && (
          <a
            onClick={() => handleMenuClick("/pengajuan")}
            className={`flex items-center gap-3 text-lg px-4 py-3 rounded-md transition-all cursor-pointer 
              ${!open && "justify-center"} hover:bg-black/20`}
          >
            <DocumentTextIcon className="w-6 h-6 min-w-[24px]" />
            {open && <span>Pengajuan Kegiatan</span>}
          </a>
        )}

        {/* ====================== ADMIN, KAJUR, SEKJUR: DAFTAR KEGIATAN ====================== */}
        {(role === "Admin" || role === "Kajur" || role === "Sekjur") && (
          <div className="relative" ref={kegiatanRef}>
            <button
              onClick={() => {
                if (!open) {
                  setOpen(true);
                  setDropdown({ ...dropdownState, kegiatan: true });
                  return;
                }
                toggleDropdown("kegiatan");
              }}
              className={`flex items-center gap-3 text-lg px-4 py-3 rounded-md transition-all cursor-pointer 
                ${!open && "justify-center"} hover:bg-black/20 w-full`}
            >
              <ClipboardDocumentListIcon className="w-6 h-6 min-w-[24px]" />
              {open && (
                <span className="flex items-center gap-[3.5rem]">
                  Daftar Kegiatan
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`w-5 h-5 transition-transform ${
                      dropdownState.kegiatan ? "rotate-180" : ""
                    }`}
                  />
                </span>
              )}
            </button>

            {open && dropdownState.kegiatan && (
              <div className="absolute left-0 bg-gradient-to-b from-[#0F2A4A] to-[#0B614C] text-white shadow-lg rounded-md py-2 w-full z-50 border border-white/10">
                <button
                  onClick={() => navigate("/daftar")}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 w-full"
                >
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Pengajuan TOR
                </button>

                <button
                  onClick={() => navigate("/daftar-LPJ")}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 w-full"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Pengajuan LPJ
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
