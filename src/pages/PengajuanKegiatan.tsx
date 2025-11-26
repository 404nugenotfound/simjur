import React, { useState, useEffect } from "react";
import FormPengajuan from "./FormPengajuan";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type Kegiatan = {
  id: number;
  judul: string;
  status: "pending" | "disetujui" | "ditolak";
};

const PengajuanKegiatan: React.FC = () => {
  const [mode, setMode] = useState<"list" | "form">("list");
  const [data, setData] = useState<Kegiatan[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fakeData: Kegiatan[] = [
      { id: 1, judul: "Pelatihan Ormawa", status: "pending" },
      { id: 2, judul: "Seminar Nasional", status: "disetujui" },
      { id: 3, judul: "Kunjungan Industri", status: "ditolak" },
    ];
    setData(fakeData);
  }, []);

  const filtered = data.filter((item) => {
    const matching = filter === "all" ? true : item.status === filter;
    const searching = item.judul.toLowerCase().includes(search.toLowerCase());
    return matching && searching;
  });

  {
    /* Form View */
  }
  if (mode === "form") {
    return (
      <div className="p-6">
        <div className="flex justify-end">
          <button
            onClick={() => setMode("list")}
            className="mt-12 mb-6 mr-[4.2rem] px-4 py-[0.35rem] bg-[#4957B5] 
            text-white rounded font-poppins font-medium tracking-[0.05em]
            hover:bg-gray-700 transition
            "
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
    <div className="p-6">
      <h1 className="text-3xl text-black font-bebas tracking-[0.4rem] ml-[-1rem] mt-[-0.5rem] mb-20">
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
              className="p-2 pl-4 pr-10 border rounded-3xl w-full text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-8 text-gray-400 stroke-[2.3]" />
          </div>
          <button
            onClick={() => setMode("form")}
            className="px-5 py-1.5 bg-[#4957B5] text-white rounded-md font-medium tracking-[0.05em]"
          >
            Tambah
          </button>
        </div>

        {/* Tabel */}
        <div className="border border-[#86BE9E] rounded-lg overflow-hidden font-poppins">
          <table className="w-full text-left">
            <thead className="bg-[#86BE9E] tracking-[0.1em]">
              <tr>
                <th className="px-4 p-3">No</th>
                <th className="px-4 p-3">Judul Kegiatan</th>
                <th className="px-4 p-3">Status</th>
                <th className="px-4 p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item.id} className="border-b text-[#696868]">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.judul}</td>
                    <td className="p-3 capitalize">{item.status}</td>
                    <td className="p-3">
                      <button className="text-blue-600">Detail</button>
                    </td>
                  </tr>
                ))
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
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PengajuanKegiatan;
