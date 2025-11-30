import React, { useState, useEffect } from "react";
import FormPengajuan from "./FormPengajuan";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { userName } from "../pages/Layout";

type Kegiatan = {
  id: number;
  nama: string
  judul: string;
  tanggal: string;
};

const DaftarKegiatanLPJ: React.FC = () => {
  const [mode, setMode] = useState<"list" | "form" | "upload">("list");
  const [data, setData] = useState<Kegiatan[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fakeData: Kegiatan[] = [
      { id: 1, nama: userName, judul: "Pelatihan Ormawa",tanggal:"12-12-2023" },
      { id: 2, nama: userName, judul: "Seminar Nasional",tanggal:"15-12-2023" },
      { id: 3, nama: userName, judul: "Kunjungan Industri",tanggal:"20-12-2023" },
    ];
    setData(fakeData);
  }, []);

  const filtered = data.filter((item) => {
    const matching = filter === "all" ? true : item.judul === filter;
    const searching = item.judul.toLowerCase().includes(search.toLowerCase());
    return matching && searching;
  });
 

  {
    /* Tabel */
  }
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl text-black font-bebas tracking-[0.4rem] ml-[-1rem] mt-[0.8rem] mb-12">
          DAFTAR KEGIATAN LPJ
        </h1>
        <div className="border border-[#D1D1D1] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.10)] p-6">
          {/* Bagian Filter + Search + Tambah */}
          <div className="flex items-center gap-3 mb-4 font-poppins">
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
          </div>

          {/* Tabel */}
          <div className="border border-[#86BE9E] rounded-lg overflow-hidden font-poppins">
            <table className="w-full text-left">
              <thead className="bg-[#86BE9E] text-white tracking-[0.1em]">
                <tr className="text-center">
                <th className="px-4 p-3">No</th>
                <th className="px-4 p-3">Nama</th>
                <th className="px-4 p-3">Judul Kegiatan</th>
                <th className="px-4 p-3">Tanggal</th>
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
                    <tr key={item.id} className="border-b text-[#696868] text-center">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.nama}</td>
                    <td className="p-3">{item.judul}</td>
                    <td className="p-3">{item.tanggal}</td>
                    <td className="p-3">
                        <button
                          onClick={() => navigate("/detail")}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md"
                        >
                          Detail
                        </button>
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
    </Layout>
       );
    };
 export default DaftarKegiatanLPJ;

  
