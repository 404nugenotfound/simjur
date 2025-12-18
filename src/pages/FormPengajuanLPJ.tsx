import React, { useEffect, useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useActivities } from "../context/ActivitiesContext";
import InfoButton from "../components/ButtonInfo/InfoButton";

// Definisi tipe TOR
interface Tor {
  id: string | number;
  judul: string;
  penanggung_jawab?: string;
  tanggal?: string;
  dana?: string;
  tor?: {
    nomor_tor: string;
    tahun: number;
    dana: string;
    tanggal_mulai: string;
    tanggal_berakhir: string;
    tujuan?: string;
    latar_belakang?: string;
  };
  lpj?: {
    metode_pelaksanaan: string;
    dana_terpakai?: string;
    sisa_dana: number;
    peserta_mahasiswa?: number;
    peserta_alumni?: number;
    peserta_dosen?: number;
    total_peserta: number;
    created_at?: string;
    updated_at?: string;
  };
}

export default function FormPengajuanLPJ({ setMode }) {
  // === [ GET DATA ID ] ===
  const [torItems, setTorItems] = useState<Tor[]>([]);
  const [selectorTorId, setSelectorTorId] = useState(); // var di simpan di sini
  const [selectedTor, setSelectedTor] = useState<Tor | null>(null);
  const { updateData } = useActivities();
  const approvedDana = React.useMemo(() => {
  if (!selectedTor?.id) return 0;
  const stored = localStorage.getItem(`approved-dana-${selectedTor.id}`);
  return stored ? Number(stored) : 0;
}, [selectedTor]);


  // === [ SET DATA TOR GENERATE ] ===

  useEffect(() => {
    const rawKegiatan = localStorage.getItem("kegiatan");
    if (!rawKegiatan) return;

    try {
      const list = JSON.parse(rawKegiatan);
      if (!Array.isArray(list)) return;

      const kegiatanFiltered = list.filter((item) => item?.id);

      console.log("KEGIATAN FILTERED:", kegiatanFiltered);
      setTorItems(kegiatanFiltered);
    } catch (e) {
      console.error("Gagal parse JSON:", e);
    }
  }, []);

  // update selectTor id untuk dropdown
  useEffect(() => {
    const tor = torItems.find((t) => Number(t.id) === selectorTorId) || null;
    setSelectedTor(tor);
  }, [selectorTorId, torItems]);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [metode, setMetode] = useState("Luring");
  const [danaTerpakai, setDanaTerpakai] = useState("");
  const [danaTerpakaiNumber, setDanaTerpakaiNumber] = useState(0); // angka bersih
  const [pesertaMahasiswa, setPesertaMahasiswa] = useState("");
  const [pesertaAlumni, setPesertaAlumni] = useState("");
  const [pesertaDosen, setPesertaDosen] = useState("");
  const [totalPeserta, setTotalPeserta] = useState("");
  const [sisaDana, setSisaDana] = useState(0);

  const formatCurrency = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(numbersOnly));
  };

  useEffect(() => {
    const total = pesertaMahasiswa + pesertaAlumni + pesertaDosen;
    setTotalPeserta(total);
  }, [pesertaMahasiswa, pesertaAlumni, pesertaDosen]);

  useEffect(() => {
    if (!selectedTor) return;

    setSisaDana(approvedDana - danaTerpakaiNumber);
  }, [approvedDana, danaTerpakaiNumber, selectedTor]);

  const handleDanaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbersOnly = e.target.value.replace(/\D/g, "");
    setDanaTerpakai(formatCurrency(numbersOnly)); // tampilan "Rp ..."
    setDanaTerpakaiNumber(Number(numbersOnly)); // angka bersih
  };

  const generateWord = async (data: any) => {
    const TEMPLATE_PATH = "/templates/TemplateLPJ.docx";

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

    const filename = `LPJ-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 1000
    )}_${data.judul_kegiatan || ""}.docx`;
    saveAs(blob, filename);
  };

  const resetForm = () => {
    setMetode("Luring");
    setDanaTerpakai("");
    setPesertaMahasiswa("");
    setPesertaAlumni("");
    setPesertaDosen("");
  };

  const handleSubmit = async () => {
    if (!selectedTor) {
      alert("Pilih TOR terlebih dahulu!");
      return;
    }
    

    const formData = {
      tor_id: selectedTor.id,
      tor_judul: selectedTor.judul,
      tor_penanggung_jawaban: selectedTor.penanggung_jawab,
      dana_diajukan: selectedTor.dana,
      tanggal: selectedTor.tanggal,

      tahun: new Date().getFullYear(),
      tanggal_generate: new Date().toLocaleDateString("id-ID"),
      metode_pelaksanaan: metode,

      dana_terpakai: danaTerpakai,
      sisa_dana: sisaDana,

      peserta_mahasiswa: pesertaMahasiswa,
      peserta_alumni: pesertaAlumni,
      peserta_dosen: pesertaDosen,
      total_peserta: totalPeserta,

      nama_kajur: "Dr. Anita Hidayati, S.Kom., M.Kom.",
      nip_kajur: "197908032003122003",
      nip_penanggung_jawab: "( Diisi Manual )",
    };

    // langsung generate file Word
    await generateWord(formData);

    const update = {
      lpj: {
          dana_terpakai: danaTerpakai, // string OK (buat display)
      peserta_mahasiswa: Number(pesertaMahasiswa || 0),
      peserta_alumni: Number(pesertaAlumni || 0),
      peserta_dosen: Number(pesertaDosen || 0),
      total_peserta:
        Number(pesertaMahasiswa || 0) +
        Number(pesertaAlumni || 0) +
        Number(pesertaDosen || 0),
      sisa_dana: sisaDana,
      metode_pelaksanaan: metode,
      created_at:
        selectedTor?.lpj?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    };
    updateData(selectedTor.id, update);

    resetForm();
    setMode("list"); // optional, kalau mau balik ke list
  };

  useEffect(() => {
    if (torItems.length > 0 && !selectedTor) {
      setSelectedTor(null);
    }
  }, [torItems]);

  return (
    <div className="px-12 pt-8 pb-6">
      {/* Form */}
      <h2 className="text-3xl font-bebas mb-24 tracking-[0.4rem] ml-[-1rem] mt-[-9.7rem] text-black">
        TAMBAH DATA PENGAJUAN LPJ
      </h2>
      <div className="flex justify-center w-full px-6">
        {/* Card Container */}
        <div className="bg-white shadow-md border rounded-xl p-5 w-full max-w-6xl">
          {/* Title */}
          <div className="space-y-10   font-poppins pb-5">
            {/* Baris 1: Metode & Dana */}
            <div className="grid grid-cols-3 gap-6 items-start">
              

              {/* ngambil ID*/}
              <div className="col-span-2 w-full">
                <label className="flex items-center gap-2 text-black font-semibold mb-1">
                  Nama Kegiatan
                  <InfoButton text="Pilih judul kegiatan sesuai TOR yang telah disetujui. Lalu data kegiatan akan ditarik otomatis dari TOR terkait." />
                </label>

                <div className="flex items-center gap-3">
                  {torItems.length === 0 ? (
                    <p className="text-gray-500">
                      Tidak ada TOR di localStorage.
                    </p>
                  ) : (
                    <div className="relative w-full">
                      <select
                        aria-label="Pilih TOR"
                        className="border border-black rounded-lg p-2 w-full appearance-none"
                        value={selectedTor ? selectedTor.id.toString() : ""}
                        onChange={(e) => {
                          const selectedId = Number(e.target.value);
                          const tor =
                            torItems.find((t) => t.id === selectedId) || null;
                          setSelectedTor(tor);
                          console.log("TOR dipilih:", tor);
                        }}
                      >
                        <option value="" disabled>
                          Pilih TOR
                        </option>
                        {torItems.map((tor) => (
                          <option key={tor.id} value={tor.id.toString()}>
                            {tor.judul} — {tor.penanggung_jawab}
                          </option>
                        ))}
                      </select>

                      <ChevronDownIcon className="pointer-events-none h-5 w-5 text-black absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  )}
                </div>
              </div>

              {/* Metode Pelaksanaan */}
              <div className="w-full">
                <label className="flex items-center gap-2 text-black font-semibold mb-1">
                  Metode Pelaksanaan
                </label>

                <div className="flex items-center justify-between">
                  <span className="text-black text-[15px]">
                    Pilih Metode Acara:
                  </span>

                  {/* Select + custom arrow container */}
                  <div className="relative w-28">
                    <select
                      className="border border-black rounded-lg p-2 text-black w-full
                      appearance-none pr-8"
                      value={metode}
                      onChange={(e) => setMetode(e.target.value)}
                      onClick={() => setOpenDropdown(!openDropdown)}
                      aria-label="-"
                    >
                      <option value="Luring">Luring</option>
                      <option value="Daring">Daring</option>
                    </select>

                    {/* Heroicon arrow */}
                    <ChevronDownIcon
                      className={`pointer-events-none h-5 w-5 text-black absolute right-2 top-1/2 -translate-y-1/2
                      transition-transform duration-200 ${
                        openDropdown ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Jumlah Peserta */}
            <div>
              <label className="block text-black font-semibold mb-3">
                Jumlah Peserta (Orang)
              </label>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-sm">Mahasiswa</label>
                  <input
                  type="text"
                  inputMode="numeric"
                  className="appearance-none border border-black rounded-lg w-full p-2 text-black"
                  placeholder="0"
                  value={pesertaMahasiswa}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setPesertaMahasiswa(v);
                  }}
                />
                </div>

                <div>
                  <label className="text-sm">Alumni</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="appearance-none border border-black rounded-lg w-full p-2 text-black"
                    placeholder="0"
                    value={pesertaAlumni}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setPesertaAlumni(v);
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm">Dosen</label>
                 <input
                  type="text"
                  inputMode="numeric"
                  className="appearance-none border border-black rounded-lg w-full p-2 text-black"
                  placeholder="0"
                  value={pesertaDosen}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setPesertaDosen(v);
                  }}
                />
                </div>
              </div>
            </div>

            {/* Jumlah Dana */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-2 text-black font-semibold mb-1">
                  Jumlah Dana Yang Digunakan
                  <InfoButton text="Masukkan dana yang benar-benar digunakan. Jika lebih kecil dari dana TOR, sisa dana akan otomatis dikembalikan ke dana tersedia." />
                </label>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    className="appearance-none border border-black rounded-lg w-[20rem] p-2 text-black"
                    placeholder="Rp 0"
                    value={danaTerpakai}
                    onChange={handleDanaChange}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-[#4957B5] text-white font-medium rounded-lg hover:bg-[#3e4b99] transition-colors duration-300"
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
