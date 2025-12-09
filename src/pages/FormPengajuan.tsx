import React, { useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export default function FormPengajuan({ addData, setMode }) {
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalBerakhir, setTanggalBerakhir] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [dana, setDana] = useState("");
  // const [selectedActivity, setSelectedActivity] = useState<Kegiatan | null>(null);

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

  const generateWord = async (data: any) => {
    const TEMPLATE_PATH = "/templates/TemplateTOR.docx";

    let response: Response;
    try {
      response = await fetch(TEMPLATE_PATH);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Gagal load template. Cek path / internet.");
      return;
    }

    if (!response.ok) {
      alert(`Template tidak ditemukan (HTTP ${response.status})`);
      return;
    }

    const content = await response.arrayBuffer();
    console.log("Template size:", content.byteLength);

    let zip;
    try {
      zip = new PizZip(content);
    } catch (err) {
      console.error("❌ Template bukan ZIP/Corrupt:", err);
      alert("Template corrupt atau bukan DOCX valid.");
      return;
    }

    if (!zip.files["word/document.xml"]) {
      console.error("❌ word/document.xml tidak ada di file.");
      alert("Template bukan DOCX standar.");
      return;
    }

    const docXml = zip.files["word/document.xml"].asText();

    let doc;
    try {
      doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: "{{", end: "}}" }, // 🔥 tambah delimiter biar strict
      });
    } catch (err: any) {
      console.error("❌ Constructor Error:", err);
      alert("Template error. Lihat console snippet.");
      return;
    }

    // 🧪 Debug: cek placeholder apa yg terbaca
    try {
      const tags = doc.getTags();
      console.log("Detected tags:", tags);
    } catch (e) {
      console.warn("getTags() gagal:", e);
    }

    try {
      doc.render(data);
    } catch (error: any) {
      console.error("❌ RENDER ERROR:", error);

      const props = error.properties;
      if (props?.offset) {
        const off = props.offset;
        const start = Math.max(0, off - 120);
        const end = Math.min(docXml.length, off + 120);

        console.log(
          "Snippet Error XML:\n\n",
          docXml.substring(start, end),
          "\n---------------------"
        );
      }

      alert("Template salah. Perbaiki placeholder. Cek console.");
      return;
    }

    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const filename = `TOR-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 1000
    )}_${data.judul_kegiatan.replace(/\s+/g, "_")}.docx`;
    saveAs(blob, filename);
  };

  const resetForm = () => {
    setNamaKegiatan("");
    setTanggalMulai("");
    setTanggalBerakhir("");
    setPenanggungJawab("");
    setDana("");
    setDeskripsi("");
  };

  const handleSubmit = async () => {
    const nomorTor =
      "TOR-" +
      new Date().getFullYear() +
      "-" +
      Math.floor(Math.random() * 1000);

    // 🔥 Data lengkap untuk Word
    const formData = {
      nomor_tor: nomorTor,
      tahun: new Date().getFullYear(),
      tanggal_generate: new Date().toLocaleDateString("id-ID"),

      judul_kegiatan: namaKegiatan,
      tanggal_mulai: tanggalMulai,
      tanggal_berakhir: tanggalBerakhir,
      penanggung_jawab: penanggungJawab,
      dana_diajukan: dana,
      deskripsi_kegiatan: deskripsi,

      tujuan: "( Diisi Manual )",
      latar_belakang: "( Diisi Manual )",

      nama_kajur: "Bu Anita",
      nip_kajur: "1234567",
      nip_penanggung_jawab: "( Diisi Manual )",
    };

    // 🔥 Generate Word dulu
    await generateWord(formData);

    // 🔥 Data yg disimpan ke context (fix struktur)
    const tableItem = {
      id: Math.floor(Math.random() * 10000000), // now matches type string
      judul: namaKegiatan,
      tanggal: new Date().toLocaleDateString("id-ID"),
      penanggung_jawab: penanggungJawab,
      dana: dana,
      deskripsi: deskripsi,

      tor: {
        nomor_tor: nomorTor,
        tahun: new Date().getFullYear(),
        dana: dana,
        tanggal_mulai: tanggalMulai,
        tanggal_berakhir: tanggalBerakhir,
        tujuan: "( Diisi Manual )",
        latar_belakang: "( Diisi Manual )",
        created_at: new Date().toISOString(),
      },
    };

    // 🔥 Simpan
    addData(tableItem);

    // 🔥 Reset form
    resetForm();

    // 🔥 Balik ke list
    setMode("list");
  };

  return (
    <div className="px-12 pt-8 pb-8">
      <h2 className="text-3xl font-bebas mb-24 tracking-[0.4rem] ml-[-1rem] mt-[-9.7rem] text-black">
        TAMBAH DATA PENGAJUAN TOR
      </h2>

      <div className="flex justify-center w-full px-6">
        <div className="bg-white shadow-md border rounded-xl p-6 w-full max-w-6xl">
          <div className="space-y-5 pb-[1rem] font-poppins">
            {/* Nama Kegiatan */}
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

            {/* Tanggal mulai & berakhir */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-black font-semibold mb-1">
                  Tanggal Kegiatan Dimulai
                </label>
                <input
                  type="date"
                  className="appearance-none border border-black rounded-lg w-full p-2 text-gray-400 uppercase font-medium"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  aria-label="-"
                />
              </div>

              <div>
                <label className="block text-black font-semibold mb-1">
                  Tanggal Kegiatan Berakhir
                </label>
                <input
                  type="date"
                  className="appearance-none border border-black rounded-lg w-full p-2 text-gray-400 uppercase font-medium"
                  value={tanggalBerakhir}
                  onChange={(e) => setTanggalBerakhir(e.target.value)}
                  aria-label="-"
                />
              </div>
            </div>

            {/* Penanggung Jawab */}
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

            {/* Deskripsi */}
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
                  className="px-6 py-2 bg-[#4957B5] text-white rounded-lg hover:bg-[#3e4b99] transition-colors duration-300 ease-in-out"
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


