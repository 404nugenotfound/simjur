import React, { useState, useEffect, useRef } from "react";
import FormPengajuan from "./FormPengajuan";
import FormPengajuanLPJ from "./FormPengajuanLPJ";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Navigate, useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { useActivities } from "../context/ActivitiesContext";
import {
  ChevronDownIcon,
  DocumentIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/solid";

type Mode = "list" | "TOR" | "LPJ";

type PengajuanProps = {
  mode: Mode;
  setMode: (m: Mode) => void;
};

// Definisi tipe TOR
interface Tor {
  id: string;
  judul: string;
  penanggung_jawab?: string;
  tanggal?: string;
  dana?: string;
  tor?: {
    nomor_tor: string;
    tahun: number;
    dana: string;
    tanggal_mulai: string;
    tanggal_berakhir: string;
    tujuan?: string;
    latar_belakang?: string;
  };
}

const PengajuanKegiatan: React.FC<PengajuanProps> = ({ mode, setMode }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const { data, setData, addData } = useActivities();
  const { approvalStatus, setApprovalStatus } = useActivities();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 5;
  const navigate = useNavigate();

  // get data TOR
  const [selectedTorId, setSelectedTorId] = useState(null);
  const [torItems, setTorItems] = useState<Tor[]>([]);

  // === LOAD DATA TOR (DIBALIK URUTANNYA) ===
  useEffect(() => {
    const rawKegiatan = localStorage.getItem("kegiatan");
    if (!rawKegiatan) return;

    try {
      const list = JSON.parse(rawKegiatan);
      if (!Array.isArray(list)) return;

      const kegiatanFiltered = list.filter((item) => item?.id);

      // Buat terbaru paling atas
      const sorted = [...kegiatanFiltered].sort(
        (a, b) => Number(b.id) - Number(a.id)
      );

      setTorItems(sorted);
    } catch (e) {
      console.error("Gagal parse JSON:", e);
    }
  }, []);

  // === FILTER + SORT UTAMA ===
  const filtered = [...data] // clone dulu biar aman
    .reverse() // urutan terbaru paling atas
    .filter((item) => {
      const matching = filter === "all" ? true : item.judul === filter;
      const searching =
        item?.judul?.toLowerCase()?.includes(search.toLowerCase()) ?? false;
      return matching && searching;
    });

  // === PAGINATION ===
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  // === LOAD APPROVAL STATUS ===
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("approvalStatus") || "{}");
    setApprovalStatus(saved);
  }, [setApprovalStatus]);

  const handleApprove = (
    activityId: number,
    field: "approval1Status" | "approval2Status" | "approval3Status"
  ) => {
    const updated = {
      ...approvalStatus,
      [activityId]: {
        ...approvalStatus[activityId],
        [field]: "Approved",
      },
    };

    setApprovalStatus(updated);
    localStorage.setItem("approvalStatus", JSON.stringify(updated));
  };

  // === DROPDOWN OUTSIDE CLICK ===
  const [openDropdown, setOpenDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset page kalau search berubah
  useEffect(() => {
    setPage(1);
  }, [search]);

  // === DELETE DATA ===
  const handleDelete = (id: number) => {
    if (!window.confirm("Ose yakin mo hapus par data ini ka seng ?")) return;

    const updated = data.filter((item) => item.id !== id);
    setData(updated);

    localStorage.setItem("kegiatan", JSON.stringify(updated));
  };

  {
    /* Form View */
  }
  if (mode === "TOR") {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between w-full mt-[7.5rem] px-20">
          <button
            className="border border-black px-5 py-1 bg-gray-700 rounded-lg 
          text-white font-bold pointer-events-none tracking-[0.05em]"
          >
            Form TOR
          </button>
          <button
            onClick={() => setMode("list")}
            className="px-4 py-[0.35rem] bg-[#4957B5] text-white rounded font-poppins font-medium tracking-[0.05em] hover:bg-[#3e4b99] transition-colors duration-300 ease-in-out"
          >
            ← Kembali
          </button>
        </div>
        <FormPengajuan addData={addData} setMode={setMode} /> {/* khusus TOR */}
      </div>
    );
  }

  if (mode === "LPJ") {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between w-full mt-[7.5rem] px-20">
          <button
            className="border border-black px-5 py-1 bg-gray-700 rounded-lg 
          text-white font-bold pointer-events-none tracking-[0.05em]"
          >
            Form LPJ
          </button>
          <button
            onClick={() => setMode("list")}
            className="px-4 py-[0.35rem] bg-[#4957B5] text-white rounded font-poppins font-medium tracking-[0.05em] hover:bg-[#3e4b99] transition-colors duration-300 ease-in-out"
          >
            ← Kembali
          </button>
        </div>

        <FormPengajuanLPJ setMode={setMode} />
      </div>
    );
  }

  {
    /* Tabel */
  }
  return (
    <div className="p-12">
      <h1 className="text-3xl text-black font-bebas tracking-[0.4rem] ml-[-1rem] mt-3 mb-12">
        PENGAJUAN KEGIATAN
      </h1>
      <div className="border border-[#D1D1D1] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.10)] p-6">
        {/* Bagian Filter + Search + Tambah */}
        <div className="flex items-center gap-3 mb-4 font-poppins">
          {/* container input + icon */}
          <div className="relative flex-1 mr-[20rem]">
            <input
              type="text"
              placeholder="Telusuri Kegiatan ..."
              className="p-2 pl-4 pr-10 border rounded-3xl w-full text-sm text-black font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-8 text-gray-400 stroke-[2.3]" />
          </div>

          <div ref={ref} className="relative inline-block">
            {/* Tombol Tambah */}
            <button
              onClick={() => setOpenDropdown(!openDropdown)}
              className="flex items-center gap-2 px-5 py-1.5 bg-[#4957B5] text-white rounded-md font-medium tracking-[0.05em] hover:bg-[#3e4b99] transition-colors duration-300 ease-in-out"
            >
              Tambah
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform duration-200 ${
                  openDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Dropdown */}
            {openDropdown && (
              <div className="absolute top-full left-0 mt-2 w-36 bg-white rounded-md shadow-lg z-50 overflow-hidden animate-dropdown">
                <button
                  className="w-full group flex items-center gap-2 px-10 py-3 hover:bg-gray-400 transition text-md"
                  onClick={() => {
                    // setSelectedActivity(null);
                    setMode("TOR");
                    setOpenDropdown(false);
                  }}
                >
                  <DocumentIcon className="h-6 w-6 text-gray-600 group-hover:text-white" />
                  <span className="group-hover:text-white font-medium tracking-[0.05em]">
                    TOR
                  </span>
                </button>

                <button
                  className={`w-full group flex items-center gap-2 px-10 py-3 hover:bg-gray-400 transition text-sm`}
                  onClick={() => {
                    setMode("LPJ");
                    setOpenDropdown(false);
                  }}
                >
                  <DocumentChartBarIcon className="h-6 w-6 text-gray-600 group-hover:text-white" />
                  <span className="group-hover:text-white font-medium tracking-[0.05em] ml-[0.16rem]">
                    LPJ
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabel */}
        <div className="border border-[#86BE9E] rounded-lg overflow-hidden font-poppins">
          <table className="w-full text-left">
            <thead className="bg-[#86BE9E] tracking-[0.1em] text-center text-white font-semibold">
              <tr className="[&>th]:font-semibold">
                <th className="px-4 p-3">No.</th>
                <th className="px-4 p-3">Judul Kegiatan</th>
                <th className="px-4 p-3">Tanggal Diajukan</th>
                <th className="px-4 p-3">Detail dan Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                (() => {
                  // Parse approval sekali DI SINI, bukan di dalam map
                  const approvalStore = JSON.parse(
                    localStorage.getItem("approvalStatus") || "{}"
                  );

                  return paginatedData.map((item, index) => {
                    // === TOR STATUS (buat ngecek tombol LPJ) ===
                    const torStatus = approvalStore[item.id]?.TOR || {};

                    const isTorApproved =
                      torStatus.approval1Status === "Approved" &&
                      torStatus.approval2Status === "Approved" &&
                      torStatus.approval3Status === "Approved";

                    // === CURRENT APPROVAL DI LIST (optional) ===
                    const currentApproval = approvalStatus[String(item.id)] ?? {
                      approval1Status: "Pending",
                      approval2Status: "Pending",
                      approval3Status: "Pending",
                    };

                    return (
                      <tr
                        key={item.id}
                        className="border-b text-[#696868] text-center"
                      >
                        <td className="p-3">{startIndex + index + 1}</td>
                        <td className="p-3 font-semibold">{item.judul}</td>
                        <td className="p-3">{item.tanggal}</td>

                        <td className="p-3">
                          {/* TOR BUTTON */}
                          <button
                            onClick={() =>
                              navigate(`/detail/${item.id}`, {
                                state: { type: "TOR" },
                              })
                            }
                            className="px-5 py-1 bg-[#6B7EF4] text-white rounded-md mr-6 hover:scale-95 transition"
                          >
                            TOR
                          </button>

                          {/* LPJ BUTTON — only enabled if TOR approved 3x */}
                          <button
                            onClick={() =>
                              navigate(`/detail/${item.id}`, {
                                state: { type: "LPJ" },
                              })
                            }
                            disabled={!isTorApproved}
                            className={`px-5 py-1 rounded-md mr-6 transition hover:scale-95 ${
                              isTorApproved
                                ? "bg-[#6B7EF4] text-white cursor-pointer"
                                : "bg-[#d1d5db] text-[#7b7b7b] cursor-not-allowed opacity-60"
                            }`}
                          >
                            LPJ
                          </button>

                          {/* HAPUS */}
                          <button
                            onClick={() => handleDelete(Number(item.id))}
                            className="px-5 py-1 bg-[#9C1818] text-white rounded-md hover:scale-95 transition"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end text-black gap-2 mt-3 mr-3.5 font-poppins font-semibold">
          <button
            className="px-2 py-1 border rounded border-[C4C3C3] shadow-[0_4px_12px_rgba(0,0,0,0.20)] "
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            {"<"}
          </button>

          <span className="px-3 py-1 border rounded border-[C4C3C3] shadow-[0_4px_12px_rgba(0,0,0,0.20)]">
            {page}
          </span>

          <button
            className="px-2 py-1 border rounded border-[C4C3C3] shadow-[0_4px_12px_rgba(0,0,0,0.20)]"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(filtered.length / limit)}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PengajuanKegiatan;
