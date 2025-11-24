import React, { useState, useEffect } from "react";
import FormPengajuan from "./FormPengajuan";

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
        <button
          onClick={() => setMode("list")}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded"
        >
          ← Kembali
        </button>

        <FormPengajuan />
      </div>
    );
  }

  {
    /* Tabel */
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl text-black font-bebas mb-4">
        PENGAJUAN KEGIATAN
      </h1>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Telusuri"
          className="p-2 border rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => setMode("form")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Tambah
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-green-700">
            <tr>
              <th className="p-3">NO</th>
              <th className="p-3">Judul Kegiatan</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-black">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => (
                <tr key={item.id} className="border-b text-black">
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

      <div className="flex items-center justify-end text-black gap-2 mt-3">
        <button
          className="px-2 py-1 border rounded"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          {"<"}
        </button>

        <span className="px-3 py-1 border rounded">{page}</span>

        <button
          className="px-2 py-1 border rounded"
          onClick={() => setPage(page + 1)}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default PengajuanKegiatan;
