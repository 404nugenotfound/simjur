import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function FormPengajuan() {
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [tanggalPengajuan, setTanggalPengajuan] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [dana, setDana] = useState("");

  const formatCurrency = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(numbersOnly));
  };

  const handleDanaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDana(formatCurrency(e.target.value));
  };

  // --- 🔥 Generate PDF dulu di atas baru submit ---
  const generatePDF = (data: any) => {
    const doc = new jsPDF();

    doc.text("DOKUMEN TOR", 14, 10);

    (doc as any).autoTable({
      startY: 20,
      head: [["Field", "Isi"]],
      body: [
        ["Nomor TOR", data.nomorTor],
        ["Nama Kegiatan", data.namaKegiatan],
        ["Tanggal", data.tanggalPengajuan],
        ["Penanggung Jawab", data.penanggungJawab],
        ["Deskripsi", data.deskripsi],
        ["Dana", data.dana],
        ["Status", data.status],
      ],
    });

    doc.save(`${data.nomorTor}.pdf`);
  };

  // --- 🔥 Baru fungsi simpan disini ---
  const handleSubmit = () => {
    if (
      !namaKegiatan ||
      !tanggalPengajuan ||
      !penanggungJawab ||
      !deskripsi ||
      !dana
    ) {
      alert("Semua form harus diisi!");
      return;
    }

    const nomorTor =
      "TOR-" +
      new Date().getFullYear() +
      "-" +
      Math.floor(Math.random() * 1000);

    const newForm = {
      id: Date.now(),
      nomorTor,
      namaKegiatan,
      tanggalPengajuan,
      penanggungJawab,
      deskripsi,
      dana,
      status: "pending",
    };

    const saved = JSON.parse(localStorage.getItem("pengajuan") || "[]");
    saved.push(newForm);
    localStorage.setItem("pengajuan", JSON.stringify(saved));

    generatePDF(newForm);

    alert(`Data tersimpan!\nNomor TOR: ${nomorTor}`);

    setNamaKegiatan("");
    setTanggalPengajuan("");
    setPenanggungJawab("");
    setDeskripsi("");
    setDana("");
  };

  return (
    <div className="flex justify-center w-full">
      {/* Card Container */}
      <div className="bg-white shadow-md border rounded-xl p-6 w-[900px]">
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6 tracking-wide">
          TAMBAH DATA PENGAJUAN TOR
        </h2>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-black font-medium mb-1">
              Nama Kegiatan
            </label>
            <input
              type="text"
              className="border rounded-lg w-full p-2 text-black"
              placeholder="Masukkan nama kegiatan..."
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-medium mb-1">
                Tanggal Pengajuan
              </label>
              <input
                type="date"
                className="border rounded-lg w-full p-2 text-black"
                value={tanggalPengajuan}
                onChange={(e) => setTanggalPengajuan(e.target.value)}
                aria-label="Tanggal Pengajuan"
              />
            </div>

            <div>
              <label className="block text-black font-medium mb-1">
                Penanggung Jawab
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="border rounded-lg flex-1 p-2 text-black"
                  placeholder="Nama penanggung jawab..."
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                />
                <button className="px-4 py-2 bg-gray-300 rounded-lg">
                  TOR
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-black font-medium mb-1">
              Deskripsi
            </label>
            <textarea
              className="border rounded-lg w-full p-3 h-36 resize-none text-black"
              placeholder="Tuliskan deskripsi kegiatan..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            ></textarea>
          </div>

          {/* Dana */}
          <div>
            <label className="block text-black font-medium mb-1">
              Total Dana Dibutuhkan
            </label>
            <input
              type="text"
              className="border rounded-lg w-full p-2 text-black"
              placeholder="Rp 0"
              value={dana}
              onChange={handleDanaChange}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Simpan dan Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
