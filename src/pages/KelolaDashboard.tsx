import { useContext, useState } from "react";
import { DashboardContext } from "../context/DashboardContext";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

export default function KelolaDashboard() {
  const { addKegiatan } = useContext(DashboardContext);

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState<"TOR" | "LPJ" | "Selesai">("TOR");
  const [nominal, setNominal] = useState<number | "">("");
  const [nominalDisplay, setNominalDisplay] = useState("");

  const navigate = useNavigate();

  const formatRupiah = (value: number | "") => {
    if (value === "" || isNaN(Number(value))) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setNominal("");
      setNominalDisplay("");
    } else {
      setNominal(Number(raw));
      setNominalDisplay(formatRupiah(Number(raw)));
    }
  };

  const handleSubmit = () => {
    if (!nama.trim()) return alert("Nama kegiatan wajib diisi");
    if (nominal === "" || isNaN(Number(nominal)))
      return alert("Nominal harus angka");

    // Simpan kegiatan
    addKegiatan({
      nama,
      kategori,
      nominal: Number(nominal),
      status: "pending",
    });

    navigate("/dashboard");
  };

 return (
    <Layout>
      <div className="p-12 font-poppins">
        
        <h1 className="text-3xl font-bebas tracking-[0.4rem] mb-10 text-black">
          Kelola Dashboard
        </h1>

        <div className="border rounded-xl shadow p-6 bg-white shadow">
          
          {/* NAMA */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Nama Kegiatan</label>
            <input
              className="border p-3 rounded w-full"
              placeholder="Nama kegiatan..."
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          {/* KATEGORI */}
          <div className="mb-5">
            <label className="block font-medium mb-1">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as any)}
              className="border p-3 rounded w-full"
              aria-label="-"
            >
              <option value="TOR">TOR</option>
              <option value="LPJ">LPJ</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* NOMINAL */}
          <div className="mb-6">
            <label className="block font-medium mb-1">
              Nominal Kegiatan (Rp)
            </label>
            <input
              type="text"
              className="border p-3 rounded w-full"
              placeholder="Rp 0"
              value={nominalDisplay}
              onChange={handleNominalChange}
            />
          </div>

          {/* BUTTON SIMPAN */}
          <button
            className="bg-blue-600 text-white py-3 px-6 rounded w-full font-medium
            hover:scale-[0.98] transition"
            onClick={handleSubmit}
          >
            Simpan
          </button>

        </div>
      </div>
    </Layout>
  );
}
