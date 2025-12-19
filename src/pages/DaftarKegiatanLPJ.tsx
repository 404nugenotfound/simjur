import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { useActivities } from "../context/ActivitiesContext";
import { roleToName } from "../utils/roleToName";



const DaftarKegiatanLPJ: React.FC = () => {
    const { data } = useActivities();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 5;
    const navigate = useNavigate();
    const namaPengaju = roleToName["pengaju"];
  
    // === FILTER + SORT UTAMA ===
  const filtered = [...data]
  .reverse()
  .filter((item) => {
    // === CEK TOR SUDAH APPROVED 3 ===
    const isTorApproved =
      item?.torApproval1Status === "Approved" &&
      item?.torApproval2Status === "Approved" &&
      item?.torApproval3Status === "Approved";

    // === CEK JUDUL ===
    const matching = filter === "all" ? true : item.judul === filter;

    // === SEARCH ===
    const searching = item?.judul?.toLowerCase()?.includes(search.toLowerCase()) ?? false;

    // === RETURN UTAMA ===
    return isTorApproved && matching && searching;
  });



  
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
  
    const paginatedData = filtered.slice(startIndex, endIndex);
  
     useEffect(() => {
        setPage(1);
      }, [search]);

  {
    /* Tabel */
  }
  return (
    <Layout>
      <div className="p-12">
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
          <div className="border rounded-lg overflow-hidden font-poppins">
            <table className="w-full text-left">
              <thead className="bg-[#86BE9E] text-white tracking-[0.1em] font-semibold">
                <tr className="text-center [&>th]:font-semibold">
                <th className="px-4 p-3">No</th>
                <th className="px-4 p-3">Nama Pengaju</th>
                <th className="px-4 p-3">Judul Kegiatan</th>
                <th className="px-4 p-3">Tanggal Diajukan</th>
                <th className="px-4 p-3">Aksi</th>
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
                  paginatedData.map((item, index) => (
                    <tr key={item.id} className="border-b text-[#696868] text-center">
                    <td className="p-3">{startIndex + index + 1}</td>
                    <td className="p-3">{namaPengaju}</td>
                    <td className="p-3 font-semibold">{item.judul}</td>
                    <td className="p-3">{item.tanggal}</td>
                    <td className="p-3">
                        <button
                          onClick={() => 
                            navigate(`/detail/${item.id}`, {
                              state: {
                              type: "LPJ",
                            },
                            })
                          }
                          className="px-3 py-1 bg-[#6B7EF4] text-white rounded-md hover:scale-95 transition"
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
              disabled={page >= Math.ceil(filtered.length / limit)}
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

  
