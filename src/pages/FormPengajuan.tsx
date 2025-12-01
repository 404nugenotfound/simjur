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
    <div className="p-12">
    {/* Form */}
       <h2 className="text-3xl font-bebas mb-20 tracking-[0.4rem] ml-[-1rem] mt-[-8.5rem] text-black">
          TAMBAH DATA PENGAJUAN TOR
        </h2>
        
    <div className="flex justify-center w-full mt-20 px-6">  
      {/* Card Container */}
      <div className="bg-white shadow-md border rounded-xl p-6 w-full max-w-6xl">
        {/* Title */}
        <div className="space-y-5 pb-[1rem] font-poppins">
          <div>
            <label className="block text-black font-semibold mb-1">
              Nama Kegiatan
            </label>
            <input
              type="text"
              className="appearance-none border border-black rounded-lg w-full p-2 text-black"
              placeholder="Masukkan nama kegiatan..."
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-semibold mb-1">
                Tanggal Pengajuan
              </label>
              <input
                type="date"
                className="appearance-none border border-black rounded-lg w-full p-2 text-gray-400 uppercase font-medium"
                value={tanggalPengajuan}
                onChange={(e) => setTanggalPengajuan(e.target.value)}
                aria-label="Tanggal Pengajuan"
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-1">
                Penanggung Jawab
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="appearance-none border border-black rounded-lg flex-1 p-2 text-black"
                  placeholder="Nama penanggung jawab..."
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                />
                <button className="appearance-none border border-black px-4 py-2 bg-[#D5D5D5] rounded-lg text-black text-opacity-60 font-semibold">
                  TOR
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-black font-semibold mb-1">
              Deskripsi
            </label>
            <textarea
              className="appearance-none border border-black rounded-lg w-full p-3 h-36 resize-none text-black"
              placeholder="Tuliskan deskripsi kegiatan..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            ></textarea>
          </div>

          {/* Dana */}
          <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-black font-semibold mb-1">
              Total Dana Dibutuhkan
            </label>
            <input
              type="text"
              className="appearance-none border border-black rounded-lg w-[20rem] p-2 text-black"
              placeholder="Rp 0"
              value={dana}
              onChange={handleDanaChange}
            />
          </div>

          {/* Submit */}
          <div className="font-medium">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#4957B5] text-white rounded-lg hover:bg-gray-700 transition"
            >
              Simpan dan Generate
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
