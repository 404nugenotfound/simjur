import { useContext, useState } from "react";
import { DashboardContext } from "../context/DashboardContext";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

export default function KelolaDashboard() {
  const { addKegiatan, updateDana } = useContext(DashboardContext);

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState<"TOR" | "LPJ" | "Selesai">("TOR");
  const [nominal, setNominal] = useState<number | "">("");
  const [nominalDisplay, setNominalDisplay] = useState("");

  const [danaRegular, setDanaRegular] = useState<number | "">("");
  const [danaRegularDisplay, setDanaRegularDisplay] = useState("");

  const [danaTerpakai, setDanaTerpakai] = useState<number | "">("");
  const [danaTerpakaiDisplay, setDanaTerpakaiDisplay] = useState("");

  const handleDanaRegularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setDanaRegular("");
      setDanaRegularDisplay("");
    } else {
      setDanaRegular(Number(raw));
      setDanaRegularDisplay(formatRupiah(Number(raw)));
    }
  };

  const handleDanaTerpakaiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setDanaTerpakai("");
      setDanaTerpakaiDisplay("");
    } else {
      setDanaTerpakai(Number(raw));
      setDanaTerpakaiDisplay(formatRupiah(Number(raw)));
    }
  };

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const raw = e.target.value.replace(/\D/g, ""); // ambil angka aja

  if (raw === "") {
    setNominal("");
    setNominalDisplay("");
  } else {
    setNominal(Number(raw));
    setNominalDisplay(formatRupiah(Number(raw)));
  }
};

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!nama.trim()) return alert("Nama kegiatan wajib diisi");

    if (nominal === "" || isNaN(Number(nominal)))
      return alert("Nominal harus angka");

    if (danaRegular === "" || danaTerpakai === "")
      return alert("Dana regular & terpakai wajib diisi");

    // Simpan Kegiatan
    addKegiatan({
      nama,
      kategori,
      nominal: Number(nominal),
      status: "pending",
    });

    // Simpan Dana Dashboard
    updateDana(Number(danaRegular), Number(danaTerpakai));

    navigate("/dashboard");
  };

  const formatRupiah = (value: number | "") => {
  if (value === "" || isNaN(Number(value))) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(Number(value));
};


  return (
    <Layout>
      <div className="p-12">
        <h1 className="text-3xl font-bebas mb-12 tracking-[0.4rem] ml-[-1rem] text-black">
          Kelola Dashboard
        </h1>

        <div className="font-poppins">

          {/* NAMA */}
          <label className="block mb-2">Nama Kegiatan</label>
          <input
            className="border p-2 rounded w-full mb-4"
            placeholder="Nama kegiatan..."
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          {/* KATEGORI */}
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

          {/* NOMINAL KEGIATAN */}
          <label className="block mb-2">Nominal Kegiatan (Rp)</label>
          <input
            type="text"
            className="border p-2 rounded w-full mb-6"
            placeholder="Rp 0"
            value={nominalDisplay}
            onChange={handleNominalChange}
          />

          {/* DANA REGULAR */}
          <label className="block mb-2">Dana Regular</label>
          <input
            type="text"
            className="border p-2 rounded w-full mb-4"
            placeholder="Rp 0"
            value={danaRegularDisplay}
            onChange={handleDanaRegularChange}
          />

          {/* DANA TERPAKAI */}
          <label className="block mb-2">Dana Terpakai</label>
          <input
            type="text"
            className="border p-2 rounded w-full mb-6"
            placeholder="Rp 0"
            value={danaTerpakaiDisplay}
            onChange={handleDanaTerpakaiChange}
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
