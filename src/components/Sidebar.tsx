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
  const isAdmin = roleId === 1;
  const isAdministrasi = roleId === 2;
  const isPengaju = roleId === 3;
  const isSekretaris = roleId === 4;
  const isKetuaJurusan = roleId === 5;

  const canCreateActivity =
    isAdmin || isAdministrasi || isPengaju || isSekretaris;
  const canManageDashboard = isAdmin || isAdministrasi || isSekretaris;
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
      <div className="flex items-center justify-between mb-16 pr-1">
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

        <button onClick={() => setOpen(!open)}>
          <Bars3Icon className="w-8 h-8" />
        </button>
      </div>

      {/* ================= MENU ================= */}
      <nav className="space-y-3 ml-[-1rem] pl-5">
        {/* DASHBOARD */}
        <button
          onClick={() => go("/dashboard")}
          className="flex items-center gap-3 text-lg px-4 py-3 rounded-md hover:bg-black/20 w-full"
        >
          <ChartBarIcon className="w-6 h-6" />
          {open && <span>Dashboard</span>}
        </button>

        {/* ================= KELOLA DASHBOARD ================= */}
        {canManageDashboard && (
          <div ref={kelolaRef}>
            <button
              onClick={() => setDropdown((d) => ({ ...d, kelola: !d.kelola }))}
              className="flex items-center gap-3 text-lg px-4 py-3 rounded-md hover:bg-black/20 w-full"
            >
              <Cog6ToothIcon className="w-6 h-6" />
              {open && (
                <>
                  <span className="flex-1">Kelola Dashboard</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 transition ${
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
                  className="flex items-center gap-3 px-6 py-3 hover:bg-white/10 w-full"
                >
                  <BanknotesIcon className="w-5 h-5" />
                  Input Dana
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= PENGAJUAN ================= */}
        {canCreateActivity && (
          <button
            onClick={() => go("/pengajuan")}
            className="flex items-center gap-3 text-lg px-4 py-3 rounded-md hover:bg-black/20 w-full"
          >
            <DocumentTextIcon className="w-6 h-6" />
            {open && <span>Pengajuan Kegiatan</span>}
          </button>
        )}

        {/* ================= DAFTAR KEGIATAN ================= */}
        {canViewActivities && (
          <div ref={kegiatanRef}>
            <button
              onClick={() =>
                setDropdown((d) => ({ ...d, kegiatan: !d.kegiatan }))
              }
              className="flex items-center gap-3 text-lg px-4 py-3 rounded-md hover:bg-black/20 w-full"
            >
              <ClipboardDocumentListIcon className="w-6 h-6" />
              {open && (
                <>
                  <span className="flex-1">Daftar Kegiatan</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 transition ${
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
