import { useContext, useState } from "react";
import { DashboardContext } from "../context/DashboardContext";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

export default function KelolaDashboard() {
  const { addKegiatan } = useContext(DashboardContext);
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState<"TOR" | "LPJ" | "Selesai">("TOR");
  const [nominal, setNominal] = useState<number | "">("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!nama.trim()) return alert("Nama kegiatan wajib diisi");
    if (nominal === "" || isNaN(Number(nominal)))
      return alert("Nominal harus diisi dengan angka");

    addKegiatan({
      nama,
      kategori,
      nominal: Number(nominal),
      status: "pending", // default
    });

    // reset (opsional)
    setNama("");
    setKategori("TOR");
    setNominal("");

    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bebas mb-12 tracking-[0.4rem] ml-[-1rem] text-black">Kelola Kegiatan</h1>

        <div className="font-poppins">
        <label className="block mb-2">Nama Kegiatan</label>
        <input
          className="border p-2 rounded w-full mb-4"
          placeholder="Nama kegiatan..."
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        <label className="block mb-2">Kategori</label>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value as any)}
          className="border p-2 rounded w-full mb-4"
          aria-label="-"
        >
          <option value="TOR">TOR</option>
          <option value="LPJ">LPJ</option>
          <option value="Selesai">Selesai</option>
        </select>

        <label className="block mb-2">Nominal (Rp)</label>
        <input
          type="number"
          className="border p-2 rounded w-full mb-6"
          placeholder="0"
          value={nominal}
          onChange={(e) =>
            setNominal(e.target.value === "" ? "" : Number(e.target.value))
          }
        />

        <button
          className="mt-2 bg-blue-600 text-white py-2 px-6 rounded w-full"
          onClick={handleSubmit}
        >
          Simpan
        </button>
        </div>
      </div>
    </Layout>
  );
}
