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
  BanknotesIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ROLE_ID_MAP } from "../utils/role";

export default function Sidebar({
  setMode,
}: {
  setMode: (m: "list" | "TOR" | "LPJ") => void;
}) {
  const navigate = useNavigate();
  const { roleId, isAuthenticated } = useAuth();

  const kegiatanRef = useRef<HTMLDivElement | null>(null);
  const kelolaRef = useRef<HTMLDivElement | null>(null);

  const [dropdown, setDropdown] = useState({
    kelola: false,
    kegiatan: false,
  });

  const [open, setOpen] = useState(true);

  /* =========================
     ROLE CHECK
  ========================= */
  const isAdmin = roleId === ROLE_ID_MAP.admin;
  const isAdministrasi = roleId === ROLE_ID_MAP.administrasi;
  const isPengaju = roleId === ROLE_ID_MAP.pengaju;
  const isSekretaris = roleId === ROLE_ID_MAP.sekretaris;
  const isKetuaJurusan = roleId === ROLE_ID_MAP.ketua_jurusan;

  const canCreateActivity = isAdmin || isPengaju;

  const canManageDashboard = isAdmin || isAdministrasi;

  const canViewActivities =
    isAdmin || isAdministrasi || isKetuaJurusan || isSekretaris;

  /* =========================
     SAFE NAVIGATE (ANTI LOGOUT)
  ========================= */
  const go = (path: string) => {
    if (!isAuthenticated) return;
    setDropdown({ kelola: false, kegiatan: false });
    setMode("list");
    navigate(path);
  };

  /* =========================
     CLICK OUTSIDE DROPDOWN
  ========================= */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !kegiatanRef.current?.contains(target) &&
        !kelolaRef.current?.contains(target)
      ) {
        setDropdown({ kelola: false, kegiatan: false });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <aside
      className={`bg-gradient text-white p-4 pr-6 transition-all duration-300 flex flex-col ${
        open ? "w-80" : "w-20"
      }`}
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-20 pr-1">
        <div className="flex items-center">
          {open && (
            <>
              <img src={Logo} alt="SIMJUR" className="w-[60px] ml-2" />
              <h1 className="ml-1 text-lg font-orbitron font-extrabold tracking-[0.5rem]">
                SIMJUR
              </h1>
            </>
          )}
        </div>

        <button aria-label="-" onClick={() => setOpen(!open)}>
          <Bars3Icon className="w-8 h-8" />
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="space-y-4 ml-[-1rem] pl-5">
        <h1
          className={`flex items-center font-bebas tracking-[0.3rem] transition-all
        ${open ? "ml-4 text-lg" : "justify-center text-xs ml-0"}
      `}
        >
          {open ? "MENU" : "MENU"}
        </h1>
        {/* DASHBOARD */}
        <button
          onClick={() => go("/dashboard")}
          className={`flex items-center text-lg py-3 rounded-md hover:bg-black/20 w-[250px]
        ${open ? "gap-3 px-5 justify-start" : "justify-center px-0"}
      `}
        >
          <ChartBarIcon className="w-6 h-6 shrink-0" />
          {open && <span>Dashboard</span>}
        </button>

        {/* ================= KELOLA DASHBOARD ================= */}
        {canManageDashboard && (
          <div ref={kelolaRef}>
            <div className="w-[250px]">
            <button
              onClick={() => setDropdown((d) => ({ ...d, kelola: !d.kelola }))}
              className={`flex items-center text-lg py-3 rounded-md hover:bg-black/20 w-[250px]
              ${open ? "gap-3 px-5 justify-start" : "justify-center px-0"}
            `}
            >
              <Cog6ToothIcon className="w-6 h-6" />
              {open && (
                <>
                  <span className="flex">Kelola Dashboard</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 mt-1 transition ${
                      dropdown.kelola ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {open && dropdown.kelola && (
              <div className="bg-gradient-to-b from-[#0F2A4A] to-[#0B614C] rounded-md mt-2">
                <button
                  onClick={() => go("/input")}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 w-[250px]"
                >
                  <BanknotesIcon className="w-5 h-5" />
                  Input Dana
                </button>
              </div>
            )}
            </div>
          </div>
        )}

        {/* ================= PENGAJUAN ================= */}
        <div className="w-[250px]">
        {canCreateActivity && (
          <button
            onClick={() => go("/pengajuan")}
            className={`flex items-center text-lg py-3 rounded-md hover:bg-black/20 w-full
        ${open ? "gap-3 px-5 justify-start" : "justify-center px-0"}`}
          >
            <DocumentTextIcon className="w-6 h-6" />
            {open && <span>Pengajuan Kegiatan</span>}
          </button>
        )}
      </div>

        {/* ================= DAFTAR KEGIATAN ================= */}
        {canViewActivities && (
          <div ref={kegiatanRef} className="w-[250px]">
            <button
              onClick={() =>
                setDropdown((d) => ({ ...d, kegiatan: !d.kegiatan }))
              }
              className={`flex items-center text-lg py-3 rounded-md hover:bg-black/20 w-full
             ${open ? "gap-3 px-5 justify-start" : "justify-center px-0"} `}
            >
              <ClipboardDocumentListIcon className="w-6 h-6" />
              {open && (
                <>
                  <span className="flex">Daftar Kegiatan</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 mt-1 transition ${
                      dropdown.kegiatan ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {open && dropdown.kegiatan && (
              <div className="bg-gradient-to-b from-[#0F2A4A] to-[#0B614C] rounded-md mt-2">
                <button
                  onClick={() => go("/daftar")}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 w-full"
                >
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Pengajuan TOR
                </button>

                <button
                  onClick={() => go("/daftar-LPJ")}
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
