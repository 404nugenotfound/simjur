import React, { useState, useEffect } from "react";
import FormPengajuan from "./FormPengajuan";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Navigate, useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { useActivities } from "../context/ActivitiesContext";

type PengajuanProps = {
  mode: "list" | "form";
  setMode: (m: "list" | "form") => void;
};

const PengajuanKegiatan: React.FC<PengajuanProps> = ({ mode, setMode }) => {
  const { data, setData } = useActivities();
  const { approvalStatus } = useActivities();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 5;
  const navigate = useNavigate();

  useEffect(() => {
    setData([
      { id: 1, judul: "Pelatihan Ormawa", tanggal: "12-12-2023" },
      { id: 2, judul: "Seminar Nasional", tanggal: "15-12-2023" },
      { id: 3, judul: "Kunjungan Industri", tanggal: "20-12-2023" },
      { id: 4, judul: "Seminar Management Waktu", tanggal: "30-12-2023" },
      { id: 5, judul: "PKKP 2024", tanggal: "17-02-2024" },
      { id: 6, judul: "Expectik 2024", tanggal: "17-04-2024" },
      { id: 7, judul: "Studek TIK", tanggal: "17-08-2024" },
    ]);
  }, []);

  const filtered = data.filter((item) => {
    const matching = filter === "all" ? true : item.judul === filter;
    const searching = item.judul.toLowerCase().includes(search.toLowerCase());
    return matching && searching;
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedData = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = (id: number) => {
    if (!window.confirm("Yakin mo hapus data ini?")) return;

    const updated = data.filter((item) => item.id !== id);
    setData(updated);

    localStorage.setItem("kegiatan", JSON.stringify(updated));
  };

  {
    /* Form View */
  }
  if (mode === "form") {
    return (
      <div className="p-6">
        <div className="flex justify-end w-full mt-[8rem] px-20">
          <button
            onClick={() => setMode("list")}
            className="
            px-4 py-[0.35rem] bg-[#4957B5] 
            text-white rounded font-poppins font-medium tracking-[0.05em]
            hover:bg-[#3e4b99] transition-colors duration-300 ease-in-out"
          >
            ← Kembali
          </button>
        </div>
        <FormPengajuan />
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
          <button
            onClick={() => setMode("form")}
            className="px-5 py-1.5 bg-[#4957B5] text-white rounded-md font-medium 
            tracking-[0.05em] hover:bg-[#3e4b99] transition-colors duration-300 ease-in-out"
          >
            Tambah
          </button>
        </div>

        {/* Tabel */}
        <div className="border border-[#86BE9E] rounded-lg overflow-hidden font-poppins">
          <table className="w-full text-left">
            <thead className="bg-[#86BE9E] tracking-[0.1em] text-center text-white font-semibold">
              <tr className="[&>th]:font-semibold">
                <th className="px-4 p-3">No</th>
                <th className="px-4 p-3">Judul Kegiatan</th>
                <th className="px-4 p-3">Tanggal</th>
                <th className="px-4 p-3">Action</th>
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
                paginatedData.map((item, index) => {
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

                        <button
                          onClick={() =>
                            navigate(`/detail/${item.id}`, {
                              state: {
                                type: "LPJ",
                                judul: item.judul,
                                tanggal: item.tanggal,
                              },
                            })
                          }
                          disabled={
                            currentApproval.approval3Status !== "Approved"
                          }
                          className={`px-5 py-1 rounded-md mr-6 transition hover:scale-95 ${
                            currentApproval.approval3Status === "Approved"
                              ? "bg-[#6B7EF4] text-white cursor-pointer"
                              : "bg-[#d1d5db] text-[#7b7b7b] cursor-not-allowed opacity-60"
                          }`}
                        >
                          LPJ
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-5 py-1 bg-[#9C1818] text-white rounded-md hover:scale-95 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
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
