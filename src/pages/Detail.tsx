// src/pages/Detail.tsx
import React, { useState, DragEvent, ChangeEvent, useMemo } from "react";
import { useParams } from "react-router-dom";
import Layout from "./Layout";
import { userName } from "../components/Headerbar";
import { useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useActivities } from "../context/ActivitiesContext";

type TabKey = "detail" | "approval" | "submit";

interface DetailProps {
  mode?: "TOR" | "LPJ";
}

const Detail: React.FC<DetailProps> = ({ mode = "TOR" }) => {
  const { id } = useParams<{ id: string }>();
  const { data, files, setFiles } = useActivities();
  const { approvalStatus, setApprovalStatus } = useActivities();

  // tunggu data siap
  const activity = useMemo(() => {
    if (!data.length || !id) return null;
    return data.find((x) => String(x.id) === id) || null;
  }, [id, data]);

  console.log(
    "Detail activity ID:",
    activity?.id,
    "Current file:",
    files[activity?.id || ""]
  );

  const detailInfo = {
    nama: activity?.judul ?? "–",
    tanggal: activity?.tanggal ?? "–",
    deskripsi: activity?.deskripsi ?? "Belum ada deskripsi.",
    dana: activity?.dana ?? "Belum Dilampirkan.",
    catatanPengaju: activity?.catatanPengaju ?? "Belum ada catatan.",
  };

  const [activeTab, setActiveTab] = useState<TabKey>("detail");
  const [status, setStatus] = useState("Pending");
  const [isDragging, setIsDragging] = useState(false);

  const currentFile = files[String(activity?.id)];

  const [detailData, setDetailData] = useState(() => {
    const saved = localStorage.getItem("pengajuanDetail");
    return saved
      ? JSON.parse(saved)
      : {
          approval1Status: "Pending",
          approval2Status: "Pending",
          approval3Status: "Pending",
        };
  });

  useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("pengajuanDetail") || "{}");
  if (saved && saved.id === id) {
    setDetailData(saved);
  } else {
    setDetailData({
      approval1Status: "Pending",
      approval2Status: "Pending",
      approval3Status: "Pending",
    });
  }
}, [id]);

  const clearStorage = () => {
    localStorage.removeItem("pengajuanDetail");
    localStorage.removeItem("approvalStatus");
  };

  const handleApprove = (
    field: "approval1Status" | "approval2Status" | "approval3Status"
  ) => {
    if (!activity) return; // <- pastikan activity ada

    const updatedDetail = { ...detailData, [field]: "Approved" };
    setDetailData(updatedDetail);
    localStorage.setItem("pengajuanDetail", JSON.stringify(updatedDetail));

    const currentContext = approvalStatus[String(activity.id)] ?? {
      approval1Status: "Pending",
      approval2Status: "Pending",
      approval3Status: "Pending",
    };
    const updatedContext = { ...currentContext, [field]: "Approved" };
    setApprovalStatus({ ...approvalStatus, [activity.id]: updatedContext });
    localStorage.setItem(
      "approvalStatus",
      JSON.stringify({ ...approvalStatus, [activity.id]: updatedContext })
    );
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // ==================== HANDLE DROP ====================
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    activityId: string
  ) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    setFiles((prev) => ({ ...prev, [activityId]: dropped }));

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(`file-${activityId}`, reader.result as string);
      localStorage.setItem(`file-name-${activityId}`, dropped.name);
    };
    reader.readAsDataURL(dropped);
  };

  // ==================== HANDLE INPUT FILE ====================
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activity) return;

    setFiles((prev) => ({ ...prev, [String(activity.id)]: file }));

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(`file-${activity.id}`, reader.result as string);
      localStorage.setItem(`file-name-${activity.id}`, file.name);
    };
    reader.readAsDataURL(file);
  };

  // ==================== DELETE FILE ====================
  const deleteFile = () => {
    if (!activity) return;
    setFiles((prev) => ({ ...prev, [String(activity.id)]: null }));
    localStorage.removeItem(`file-${activity.id}`);
    localStorage.removeItem(`file-name-${activity.id}`);
  };

  // ==================== LOAD FILE DARI LOCALSTORAGE ====================
  useEffect(() => {
    if (!activity) return;

    const storedBase64 = localStorage.getItem(`file-${activity.id}`);
    const storedName = localStorage.getItem(`file-name-${activity.id}`);
    if (storedBase64 && storedName) {
      const arr = storedBase64.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);

      const file = new File([u8arr], storedName, { type: mime });
      setFiles((prev) => ({ ...prev, [String(activity.id)]: file }));
    }
  }, [activity]);

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

  // tepat sebelum return JSX
  console.log(
    "Detail activity ID:",
    activity?.id,
    "Current file:",
    currentFile
  );

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
            hover:bg-[#3e4b99] transition-colors duration-300 ease-in-out"
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
                    <p className="font-medium">{detailInfo.nama}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Pengajuan</p>
                    <p className="font-medium">{detailInfo.tanggal}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Penanggung Jawab</p>
                    <p className="font-medium">{userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dana Diajukan</p>
                    <p className="font-medium">{detailInfo.dana}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-1">Deskripsi</p>
                  <p className="text-sm leading-relaxed">
                    {detailInfo.deskripsi}
                  </p>
                </div>
              </div>
            )}

            {/* APPROVAL & CATATAN */}

            {activeTab === "approval" && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                {/* Part Approval */}
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
                      {/* Approval 1 */}
                      <tr className="bg-gray-50 text-center">
                        <td className="p-2 font-semibold">Approval 1</td>
                        <td className="p-2">{detailInfo.tanggal}</td>
                        <td className="p-2">ACC dari Administrasi</td>
                        <td className="p-2">
                          {detailData.approval1Status === "Pending" ? (
                            <button
                              onClick={() => handleApprove("approval1Status")}
                              className="px-3 py-1 bg-blue-500 text-white rounded-md"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              Approved ✔
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Approval 2 */}
                      <tr className="bg-gray-100 text-center">
                        <td className="p-2 font-semibold">Approval 2</td>
                        <td className="p-2">{detailInfo.tanggal}</td>
                        <td className="p-2">ACC dari Sekjur</td>
                        <td className="p-2">
                          {detailData.approval2Status === "Pending" ? (
                            <button
                              className="bg-blue-500 text-white px-3 py-1 rounded"
                              onClick={() => handleApprove("approval2Status")}
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              Approved ✔
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Approval 3 muncul hanya jika Approval 1 & 2 sudah approved */}
                      <tr className="bg-gray-50 text-center">
                        <td className="p-2 font-semibold">Approval 3</td>
                        <td className="p-2">{detailInfo.tanggal}</td>
                        <td className="p-2">ACC dari Kajur</td>
                        <td className="p-2">
                          {detailData.approval1Status === "Approved" &&
                          detailData.approval2Status === "Approved" ? (
                            detailData.approval3Status === "Pending" ? (
                              <button
                                onClick={() => handleApprove("approval3Status")}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md"
                              >
                                Approve
                              </button>
                            ) : (
                              <span className="text-green-600 font-semibold">
                                Approved ✔
                              </span>
                            )
                          ) : (
                            <span className="text-gray-500 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Reset Storage */}
                      <tr>
                        <td colSpan={4} className="text-center">
                          <button
                            className="bg-gray-50 text-gray-50 mt-4 px-3 py-1 rounded"
                            onClick={clearStorage}
                          >
                            Reset Storage
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Part Catatan */}
                <h2 className="font-semibold py-4 pt-12">Catatan</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Catatan Admin */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      Catatan Admin
                    </p>
                    <textarea
                      className="w-full border rounded-lg p-3 min-h-80 text-gray-400"
                      value={noteAdmin || detailInfo.catatanPengaju}
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
                      className="w-full border rounded-lg p-3 min-h-80 text-gray-400"
                      value={noteSekretariat || detailInfo.catatanPengaju}
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
                      className="w-full border rounded-lg p-3 min-h-80 text-gray-400"
                      value={noteKajur || detailInfo.catatanPengaju}
                      placeholder="Catatan dari ketua jurusan..."
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBMIT FILE */}
            {activeTab === "submit" && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                <div
                  className={`rounded-3xl min-h-[180px] flex flex-col items-center justify-center px-6 transition ${
                    currentFile
                      ? "border-none bg-transparent p-0"
                      : isDragging
                      ? "border-2 border-indigo-500 border-dashed bg-indigo-50"
                      : "border-2 border-green-300 border-dashed bg-green-100/70"
                  }`}
                >
                  {!currentFile ? (
                    // INPUT MODE
                    <div className="flex flex-col items-center gap-4 p-10">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow">
                        <span className="text-2xl">⬆️</span>
                      </div>

                      <p className="font-medium text-gray-800">
                        Unggah File di sini atau Telusuri Dokumen
                      </p>
                      <p className="text-xs text-gray-600">
                        Format: PDF (max 10MB)
                      </p>

                      <button
                        type="button"
                        className="mt-2 px-4 py-2 rounded-full bg-white text-sm shadow border cursor-pointer"
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
                        aria-label="-"
                      />
                    </div>
                  ) : (
                    <div className="w-full flex justify-center mt-2">
                      <div className="flex items-center justify-between bg-[#A4CEB6] px-8 py-8 rounded-xl shadow-md w-full max-w-[900px]">
                        <p className="text-white font-semibold text-xl truncate max-w-[65%]">
                          {currentFile.name ?? "–"}
                        </p>

                        <div className="flex items-center gap-3">
                          {/* Tombol Unduh */}
                          <button
                            className="px-6 py-2.5 text-sm rounded-lg bg-[#5A6FDE] text-white font-semibold tracking-[0.05em]"
                            onClick={() => {
                              const url = URL.createObjectURL(currentFile);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = currentFile.name;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            Unduh
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            aria-label="hapus"
                            className="px-5 py-2 text-sm rounded-lg bg-[#9C1818] text-white"
                            onClick={() => {
                              setFiles((prev) => ({
                                ...prev,
                                [String(activity?.id)]: null,
                              }));

                              // Gunakan key yang sesuai dengan yang dipakai saat simpan
                              localStorage.removeItem(`file-${activity?.id}`);
                              localStorage.removeItem(
                                `file-name-${activity?.id}`
                              );
                            }}
                          >
                            <TrashIcon className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Detail;
