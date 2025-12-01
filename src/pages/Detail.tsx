// src/pages/UploadTor.tsx
import React, { useState, DragEvent, ChangeEvent, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";

type TabKey = "detail" | "approval" | "submit" | "catatan";

interface UploadTorProps {
  mode?: "TOR" | "LPJ";
}

const UploadTor: React.FC<UploadTorProps> = ({ mode = "TOR" }) => {
  const { id } = useParams<{ id: string }>();
  const saved = JSON.parse(localStorage.getItem("pengajuan") || "[]");

  // cari activity yang dipilih
  const activity = useMemo(() => {
    if (!id) return null;

    const saved = JSON.parse(localStorage.getItem("pengajuan") || "[]");
    return saved.find((a: any) => String(a.id) === id) || null;
  }, [id]);

  const [activeTab, setActiveTab] = useState<TabKey>("detail");

  // state upload (submit file tab)
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  // detail diambil dari activity atau fallback
  const detailData = {
    nama: activity?.namaKegiatan ?? "–",
    tanggal: activity?.tanggalPengajuan ?? "–",
    pj: activity?.penanggungJawab ?? "–",
    deskripsi: activity?.deskripsi ?? "–",
    dana: activity?.dana ?? "–",
    catatanPengaju: activity?.catatanPengaju ?? "Belum ada catatan.",
  };

  // 3 catatan role (simpan lokal dulu – nanti bisa dihubungkan ke backend/context)
  const [noteAdmin, setNoteAdmin] = useState("");
  const [noteSekretariat, setNoteSekretariat] = useState("");
  const [noteKajur, setNoteKajur] = useState("");

  const handleSaveNotes = () => {
    console.log("Catatan disimpan:", {
      admin: noteAdmin,
      sekretariat: noteSekretariat,
      kajur: noteKajur,
    });
    alert("Catatan disimpan (sementara masih di front-end).");
  };

  return (
    <Layout>
      <div className="p-12">
        {/* Header */}
        <div className="mb-4 ml-[-1.2rem]">
          <h1 className="text-3xl tracking-[0.4rem] text-black font-bebas">
            PENGAJUAN {mode}
          </h1>
          <div className="flex justify-end w-full mt-[3rem] mb-6 px-14">
            <button
              type="button"
              onClick={() => window.history.back()}
              className=" 
            px-4 py-[0.35rem]  mr-[-3.2rem] bg-[#4957B5] 
            text-white rounded font-poppins font-medium tracking-[0.05em]
            hover:bg-gray-700 transition"
            >
              ← Kembali
            </button>
          </div>
        </div>

        {/* Tabs container */}
        <div className="bg-white rounded-xl shadow mb-6 overflow-hidden font-poppins">
          {/* Tabs */}
          <div className="flex border-b font-bold tracking-[0.05em]">
            <button
              className={`flex-1 py-3 text-sm ${
                activeTab === "detail"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("detail")}
            >
              Detail
            </button>
            <button
              className={`flex-1 py-3 text-sm ${
                activeTab === "approval"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("approval")}
            >
              Approval
            </button>
            <button
              className={`flex-1 py-3 text-sm ${
                activeTab === "submit"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("submit")}
            >
              Submit File
            </button>
            <button
              className={`flex-1 py-3 text-sm ${
                activeTab === "catatan"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("catatan")}
            >
              Catatan
            </button>
          </div>

          {/* Tab content */}
          <div className="p-8">
            {/* DETAIL */}
            {activeTab === "detail" && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                <h2 className="font-semibold mb-4">Detail Pengajuan</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nama Kegiatan</p>
                    <p className="font-medium">{detailData.nama}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Pengajuan</p>
                    <p className="font-medium">{detailData.tanggal}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Penanggung Jawab</p>
                    <p className="font-medium">{detailData.pj}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Dana</p>
                    <p className="font-medium">{detailData.dana}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-1">Deskripsi</p>
                  <p className="text-sm leading-relaxed">
                    {detailData.deskripsi}
                  </p>
                </div>
              </div>
            )}

            {/* APPROVAL */}
            {activeTab === "approval" && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                <h2 className="font-semibold mb-4">Approval Status</h2>
                <div className="overflow-hidden rounded-xl border border-sm">
                  <table className="w-full text-sm text-gray-500">
                    <thead>
                      <tr className="bg-[#86BE9E] text-white">
                        <th className="p-2 text-center">Code</th>
                        <th className=" text-center">Tanggal</th>
                        <th className=" text-center">Description</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-50 text-center">
                        <td className="p-2 font-semibold">Approval 1</td>
                        <td className="p-2">{detailData.tanggal}</td>
                        <td className="p-2">ACC dari Administrasi</td>
                        <td className="p-2">Pending</td>
                      </tr>
                      <tr className="bg-gray-100 text-center">
                        <td className="p-2 font-semibold">Approval 2</td>
                        <td className="p-2">{detailData.tanggal}</td>
                        <td className="p-2">ACC dari Sekjur</td>
                        <td className="p-2">Pending</td>
                      </tr>
                      <tr className="bg-gray-50 text-center">
                        <td className="p-2 font-semibold">Approval 3</td>
                        <td className="p-2">{detailData.tanggal}</td>
                        <td className="p-2">ACC dari Kajur</td>
                        <td className="p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBMIT FILE */}
            {activeTab === "submit" && (
              <div
                className={`border-2 border-dashed rounded-3xl min-h-[180px] flex flex-col items-center justify-center px-6 py-10 transition ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-green-300 bg-green-100/70"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!file && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow">
                      <span className="text-2xl">⬆️</span>
                    </div>
                    <p className="font-medium text-gray-800">
                      Unggah File Disini atau Telusuri Dokumen
                    </p>
                    <p className="text-xs text-gray-600">
                      Unggah dokumen dalam format <b>PDF</b> (maks. 10MB)
                    </p>
                    <button
                      type="button"
                      className="mt-2 px-4 py-2 rounded-full bg-white text-sm shadow border"
                      onClick={() =>
                        document.getElementById("file-input-tor")?.click()
                      }
                    >
                      Telusuri Dokumen
                    </button>
                    <input
                      id="file-input-tor"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                      aria-label="hehe"
                    />
                  </div>
                )}

                {file && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-2xl bg-white shadow flex items-center justify-center">
                      <span className="text-4xl">🧩</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-gray-600">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-500 underline"
                      onClick={() => setFile(null)}
                    >
                      Hapus File
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CATATAN */}
            {activeTab === "catatan" && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-inner space-y-4">
                <h2 className="font-semibold mb-2">Catatan</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Catatan Admin */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Catatan Admin
                    </p>
                    <textarea
                      className="w-full border rounded-lg p-3 min-h-80"
                      value={noteAdmin}
                      placeholder="Catatan dari admin..."
                      readOnly
                    />
                  </div>

                  {/* Catatan Sekretariat */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Catatan Sekretariat
                    </p>
                    <textarea
                      className="w-full border rounded-lg p-3 min-h-80"
                      value={noteSekretariat}
                      placeholder="Catatan dari sekretariat..."
                      readOnly
                    />
                  </div>

                  {/* Catatan Kajur */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Catatan Ketua Jurusan
                    </p>
                    <textarea
                      className="w-full border rounded-lg p-3 min-h-80"
                      value={noteKajur}
                      placeholder="Catatan dari ketua jurusan..."
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadTor;
