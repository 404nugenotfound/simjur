// src/pages/Detail.tsx
import React, { useState, DragEvent, ChangeEvent, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import Layout from "./Layout";
import { useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useActivities } from "../context/ActivitiesContext";

// ----------------- TYPES -----------------
type TabKey = "detail" | "approval" | "submit";

type ApprovalState = {
  approval1Status: "Pending" | "Approved" | "Rejected";
  approval2Status: "Pending" | "Approved" | "Rejected";
  approval3Status: "Pending" | "Approved" | "Rejected";
};

type NotesState = {
  admin: string;
  sekjur: string;
  kajur: string;
};

type ModeData = {
  approval: ApprovalState;
  notes: NotesState;
  file?: string | null;
  fileName?: string | null;
};

type ActivityStore = {
  [activityId: string]: {
    TOR?: ModeData;
    LPJ?: ModeData;
  };
};

interface ApprovalData {
  approval1Status: string;
  approval2Status: string;
  approval3Status: string;
}

interface DetailProps {
  mode?: "TOR" | "LPJ";
}

const STORAGE_KEY = "activityStore";

const Detail: React.FC<DetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { data, files, setFiles, setData, approvalStatus, setApprovalStatus } =
    useActivities();
  const [currentNote, setCurrentNote] = useState("");
  const location = useLocation();

  const mode: "TOR" | "LPJ" = location.state?.type || "TOR";

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
    dana:
      activity?.full?.dana_diajukan ?? activity?.dana ?? "Belum Dilampirkan.",
    catatanPengaju: activity?.catatanPengaju ?? "Belum ada catatan.",
    penanggung_jawab: activity?.penanggung_jawab ?? "-",
    sisaDana: activity?.lpj?.sisa_dana ?? "-",
    metode_pelaksanaan: activity?.lpj?.metode_pelaksanaan ?? "-",
    total_peserta: activity?.lpj?.total_peserta ?? "[ Belum Ada Data ]",
  };

  const [activeTab, setActiveTab] = useState<TabKey>("detail");
  const [isDragging, setIsDragging] = useState(false);

  const currentFile = files[`file-${mode}-${activity?.id ?? "noid"}`] || null;

  // ---------- DEFAULT (tetap) ----------
  const defaultApproval = {
    approval1Status: "Pending",
    approval2Status: "Pending",
    approval3Status: "Pending",

    lpjApproval1Status: "Pending",
    lpjApproval2Status: "Pending",
    lpjApproval3Status: "Pending",
  };

  const [detailData, setDetailData] = useState(defaultApproval);

  const activeApproval =
    mode === "TOR"
      ? {
          approval1Status: detailData.approval1Status,
          approval2Status: detailData.approval2Status,
          approval3Status: detailData.approval3Status,
        }
      : {
          approval1Status: detailData.lpjApproval1Status ?? "Pending",
          approval2Status: detailData.lpjApproval2Status ?? "Pending",
          approval3Status: detailData.lpjApproval3Status ?? "Pending",
        };

  // ---------- MIGRATE DATA ONCE (safe) ----------
  useEffect(() => {
    if (!data || !data.length) return;

    let needsWrite = false;

    const migrated = data.map((item) => {
      // only add missing LPJ fields when absent
      const copy = { ...item } as any;
      if (copy.lpjApproval1Status === undefined) {
        copy.lpjApproval1Status = "Pending";
        copy.lpjApproval2Status = "Pending";
        copy.lpjApproval3Status = "Pending";
        needsWrite = true;
      }
      return copy;
    });

    if (needsWrite) {
      // persist migrated array and update context once
      setData(migrated);
      try {
        localStorage.setItem("kegiatan", JSON.stringify(migrated));
      } catch (e) {
        console.error("Failed to persist migrated kegiatan", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]); // run when data first loads (length change)

  // ---------- SYNC detailData FROM approvalStatus (mode-aware, guarded) ----------
  useEffect(() => {
    if (!activity) return;

    const store = JSON.parse(localStorage.getItem("approvalStatus") || "{}");
    const saved = store[activity.id]?.[mode];

    if (saved) {
      setDetailData((prev) => {
        const next = { ...defaultApproval, ...saved };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    } else {
      const next =
        mode === "TOR"
          ? {
              ...defaultApproval,
              approval1Status: "Pending",
              approval2Status: "Pending",
              approval3Status: "Pending",
            }
          : {
              ...defaultApproval,
              lpjApproval1Status: "Pending",
              lpjApproval2Status: "Pending",
              lpjApproval3Status: "Pending",
            };

      setDetailData((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
    }
  }, [activity, mode]);

  // ---------- HANDLE APPROVE (mode-aware, safe) ----------
  const handleApprove = (field: keyof typeof defaultApproval) => {
    if (!activity) return;

    const key = `file-${mode}-${activity?.id ?? "noid"}`;

    const approvalStore = JSON.parse(
      localStorage.getItem("approvalStatus") || "{}"
    );

    // get mode chunk or fallback
    const currentModeData =
      approvalStore[key]?.[mode] ??
      (mode === "TOR"
        ? {
            approval1Status: "Pending",
            approval2Status: "Pending",
            approval3Status: "Pending",
          }
        : {
            lpjApproval1Status: "Pending",
            lpjApproval2Status: "Pending",
            lpjApproval3Status: "Pending",
          });

    // updated mode-only data
    const updatedModeData = {
      ...currentModeData,
      [field]: "Approved",
    };

    const updatedAll = {
      ...approvalStore,
      [key]: {
        ...approvalStore[key],
        [mode]: updatedModeData,
      },
    };

    // persist to context + localStorage
    setApprovalStatus(updatedAll);
    try {
      localStorage.setItem("approvalStatus", JSON.stringify(updatedAll));
    } catch (e) {
      console.error("Failed to persist approvalStatus", e);
    }

    // update local detailData (merge with default so shape stays full)
    setDetailData((prev) => ({ ...defaultApproval, ...updatedModeData }));
  };

  // ---------- HANDLE REJECT (mode-aware, safe) ----------
  const handleReject = (field: keyof typeof defaultApproval) => {
    if (!activity) return;

    const key = String(activity.id);
    const approvalStore = JSON.parse(
      localStorage.getItem("approvalStatus") || "{}"
    );

    const currentModeData =
      approvalStore[key]?.[mode] ??
      (mode === "TOR"
        ? {
            approval1Status: "Pending",
            approval2Status: "Pending",
            approval3Status: "Pending",
          }
        : {
            lpjApproval1Status: "Pending",
            lpjApproval2Status: "Pending",
            lpjApproval3Status: "Pending",
          });

    const updatedModeData = {
      ...currentModeData,
      [field]: "Rejected",
    };

    const updatedAll = {
      ...approvalStore,
      [key]: {
        ...approvalStore[key],
        [mode]: updatedModeData,
      },
    };

    setApprovalStatus(updatedAll);
    try {
      localStorage.setItem("approvalStatus", JSON.stringify(updatedAll));
    } catch (e) {
      console.error("Failed to persist approvalStatus", e);
    }

    setDetailData((prev) => ({ ...defaultApproval, ...updatedModeData }));
  };

  const formatCurrency = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(numbersOnly));
  };

  // ==================== HANDLE INPUT FILE ====================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const id = activity?.id ?? "noid";

    const key = `file-${mode}-${id}`;
    const nameKey = `file-name-${mode}-${id}`;

    localStorage.setItem(key, JSON.stringify(file));
    localStorage.setItem(nameKey, file.name);

    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
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

  // ===================== STATE CATATAN PER ID =====================
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : {};
  });

  const role = localStorage.getItem("role") || "";
  // Role mapping tetap sama
  const roleToField = {
    admin: "approval1Status",
    sekjur: "approval2Status",
    kajur: "approval3Status",
  };

  const userRole = (localStorage.getItem("role") || "").toLowerCase();
  const allowedField = roleToField[userRole];

  // ===================== LOAD CATATAN SAAT COMPONENT MOUNT =====================
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

  // ===================== SIMPAN CATATAN PER-ID & PER-ROLE =====================
  const saveNote = (roleType: string, note: string) => {
    if (!activity) return;

    const activityId = String(activity.id);
    const modeKey = mode; // "TOR" atau "LPJ"

    const updated = {
      ...notes,
      [activityId]: {
        ...notes[activityId],
        [modeKey]: {
          ...notes[activityId]?.[modeKey],
          [roleType]: note,
        },
      },
    };

    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));

    alert("Catatan berhasil disimpan!");
  };

  const [hasDownloaded, setHasDownloaded] = useState(false);

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
        <div className="bg-white rounded-2xl shadow-md mb-6 px-4 py-3 font-poppins">
          <div className="flex justify-center gap-10 py-2">
            <button
              onClick={() => setActiveTab("detail")}
              className={`text-lg font-semibold tracking-wide px-6 py-2 rounded-md transition-all
                ${
                  activeTab === "detail"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-600 hover:text-[#6C74C6]"
                }
              `}
            >
              Detail Kegiatan
            </button>

            <button
              onClick={() => setActiveTab("submit")}
              className={`text-lg font-semibold tracking-wide px-6 py-2 rounded-md transition-all
              ${
                activeTab === "submit"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-indigo-600 hover:text-[#6C74C6]"
              }
            `}
            >
              {role === "Pengaju" ? "Submit File" : "Unduh File"}
            </button>

            <button
              onClick={() => setActiveTab("approval")}
              className={`text-lg font-semibold tracking-wide px-6 py-2 rounded-md transition-all
                ${
                  activeTab === "approval"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-600 hover:text-[#6C74C6]"
                }
              `}
            >
              Status Persetujuan
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-xl shadow-md mb-6 px-4 py-3 font-poppins">
          <div className="p-4">
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
                    <p className="font-medium">{detailInfo.penanggung_jawab}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dana Diajukan</p>
                    <p className="font-medium">{detailInfo.dana}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jumlah Peserta</p>
                    <p className="font-medium">
                      {detailInfo.total_peserta} peserta
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dana Tersisa</p>
                    <p className="font-medium">
                      {formatCurrency(String(detailInfo.sisaDana || 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Metode Pelaksanaan</p>
                    <p className="font-medium">
                      {detailInfo.metode_pelaksanaan}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-1">Deskripsi</p>
                  <p className="text-sm leading-relaxed font-medium">
                    {detailInfo.deskripsi}
                  </p>
                </div>
              </div>
            )}

            {/* APPROVAL & CATATAN */}

            {activeTab === "approval" && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                {/* Part Approval */}
                <h2 className="font-semibold mb-4">Status Persetujuan</h2>
                <div className="overflow-hidden rounded-xl border border-sm">
                  <table className="w-full text-sm text-gray-500">
                    <thead>
                      <tr className="bg-[#86BE9E] text-white">
                        <th className="p-2 text-center">Code</th>
                        <th className=" text-center">Tanggal Pengajuan</th>
                        <th className=" text-center">Deskripsi</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Approval 1 */}
                      <tr className="bg-gray-50 text-center">
                        <td className="p-2 font-semibold">Persetujuan 1</td>
                        <td className="p-2">{detailInfo.tanggal}</td>
                        <td className="p-2">Persetujuan dari Administrasi</td>

                        <td className="p-2">
                          {/* === STATUS: APPROVED === */}
                          {activeApproval.approval1Status === "Approved" && (
                            <span className="text-green-600 font-semibold">
                              Disetujui ✔
                            </span>
                          )}

                          {/* === STATUS: REJECTED === */}
                          {activeApproval.approval1Status === "Rejected" && (
                            <span className="text-red-600 font-semibold">
                              Ditolak ✖
                            </span>
                          )}

                          {/* === STATUS: PENDING — ROLE BERWENANG === */}
                          {activeApproval.approval1Status === "Pending" &&
                            allowedField === "approval1Status" && (
                              <div className="flex gap-2 justify-center">
                                <button
                                  disabled={!hasDownloaded}
                                  onClick={() =>
                                    handleApprove("approval1Status")
                                  }
                                  className="px-3 py-1 bg-[#4957B5] text-white 
                                  rounded-md transition hover:scale-95
                                  disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                                >
                                  Setujui
                                </button>

                                <button
                                  disabled={!hasDownloaded}
                                  onClick={() =>
                                    handleReject("approval1Status")
                                  }
                                  className="px-3 py-1 bg-red-800 text-white 
                                  rounded-md transition hover:scale-95
                                  disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}

                          {/* === STATUS: PENDING — TIDAK BERWENANG === */}
                          {activeApproval.approval1Status === "Pending" &&
                            allowedField !== "approval1Status" && (
                              <span className="text-gray-500 font-medium">
                                Pending
                              </span>
                            )}
                        </td>
                      </tr>

                      {/* Approval 2 */}
                      <tr className="bg-gray-100 text-center">
                        <td className="p-2 font-semibold">Persetujuan 2</td>
                        <td className="p-2">{detailInfo.tanggal}</td>
                        <td className="p-2">Persetujuan dari Sekjur</td>

                        <td className="p-2">
                          {/* === STATUS: APPROVED === */}
                          {activeApproval.approval2Status === "Approved" && (
                            <span className="text-green-600 font-semibold">
                              Disetujui ✔
                            </span>
                          )}

                          {/* === STATUS: REJECTED === */}
                          {activeApproval.approval2Status === "Rejected" && (
                            <span className="text-red-600 font-semibold">
                              Ditolak ✖
                            </span>
                          )}

                          {/* === STATUS: PENDING — ROLE BERWENANG === */}
                          {activeApproval.approval2Status === "Pending" &&
                            allowedField === "approval2Status" && (
                              <div className="flex gap-2 justify-center">
                                <button
                                  disabled={!hasDownloaded}
                                  onClick={() =>
                                    handleApprove("approval2Status")
                                  }
                                  className="px-3 py-1 bg-[#4957B5] text-white 
                                  rounded-md transition hover:scale-95
                                  disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                                >
                                  Setujui
                                </button>

                                <button
                                  disabled={!hasDownloaded}
                                  onClick={() =>
                                    handleReject("approval2Status")
                                  }
                                  className="px-3 py-1 bg-red-800 text-white 
                                  rounded-md transition hover:scale-95
                                  disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}

                          {/* === STATUS: PENDING — TIDAK BERWENANG === */}
                          {activeApproval.approval2Status === "Pending" &&
                            allowedField !== "approval2Status" && (
                              <span className="text-gray-500 font-medium">
                                Pending
                              </span>
                            )}
                        </td>
                      </tr>

                      {/* Approval 3 muncul hanya jika Approval 1 & 2 sudah Approved */}
                      <tr className="bg-gray-50 text-center">
                        <td className="p-2 font-semibold">Persetujuan 3</td>
                        <td className="p-2">{detailInfo.tanggal}</td>
                        <td className="p-2">Persetujuan dari Kajur</td>

                        <td className="p-2">
                          {/* === CEK: Approval 1 & 2 harus Approved dulu === */}
                          {activeApproval.approval1Status === "Approved" &&
                          activeApproval.approval2Status === "Approved" ? (
                            <>
                              {/* === STATUS: APPROVED === */}
                              {activeApproval.approval3Status ===
                                "Approved" && (
                                <span className="text-green-600 font-semibold">
                                  Disetujui ✔
                                </span>
                              )}

                              {/* === STATUS: REJECTED === */}
                              {activeApproval.approval3Status ===
                                "Rejected" && (
                                <span className="text-red-600 font-semibold">
                                  Ditolak ✖
                                </span>
                              )}

                              {/* === STATUS: PENDING — ROLE BERWENANG === */}
                              {activeApproval.approval3Status === "Pending" &&
                                allowedField === "approval3Status" && (
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      disabled={!hasDownloaded}
                                      onClick={() =>
                                        handleApprove("approval3Status")
                                      }
                                      className="px-3 py-1 bg-[#4957B5] text-white 
                                      rounded-md transition hover:scale-95
                                      disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                                    >
                                      Setujui
                                    </button>

                                    <button
                                      disabled={!hasDownloaded}
                                      onClick={() =>
                                        handleReject("approval3Status")
                                      }
                                      className="px-3 py-1 bg-red-800 text-white 
                                      rounded-md transition hover:scale-95
                                      disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed"
                                    >
                                      Tolak
                                    </button>
                                  </div>
                                )}

                              {/* === STATUS: PENDING — TIDAK BERWENANG === */}
                              {activeApproval.approval3Status === "Pending" &&
                                allowedField !== "approval3Status" && (
                                  <span className="text-gray-500 font-medium">
                                    Pending
                                  </span>
                                )}
                            </>
                          ) : (
                            // Approval 1 & 2 belum disetujui
                            <span className="text-gray-500 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-4 mt-10 mb-2">
                  <div className="flex-1 h-[2px] bg-gray-300"></div>
                  <span className="text-gray-400 text-sm tracking-wide">
                    SECTION
                  </span>
                  <div className="flex-1 h-[2px] bg-gray-300"></div>
                </div>
                {/* Part Catatan */}
                <h2 className="font-semibold py-4 pt-6">Catatan Revisi</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ============================
                        ADMIN / SEKJUR / KAJUR (boleh edit)
                      ============================ */}
                  {(role === "Admin" ||
                    role === "Sekjur" ||
                    role === "Kajur") && (
                    <div className="col-span-1 md:col-span-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        {role === "Admin"
                          ? "Catatan dari Admin"
                          : role === "Sekjur"
                          ? "Catatan dari Sekjur"
                          : "Catatan dari Ketua Jurusan"}
                      </p>
                      <div className="relative w-full">
                        <textarea
                          className="w-full border rounded-lg p-3 min-h-[12rem] pr-[5rem]"
                          value={
                            currentNote ??
                            notes[String(activity?.id)]?.[mode]?.[userRole] ??
                            ""
                          }
                          placeholder={`Catatan dari ${role.toLowerCase()}...`}
                          aria-label={`Textarea catatan dari ${role}`}
                          onChange={(e) => setCurrentNote(e.target.value)}
                        />

                        {/* Tombol Simpan di kanan bawah */}
                        <button
                          className="
                          absolute bottom-6 right-3 
                          px-4 py-1 bg-[#4957B5] 
                          text-white rounded tracking-[0.10em]
                          hover:scale-95 transition
                        "
                          onClick={() => saveNote(userRole, currentNote)}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ============================
                        PENGAJU (read only, per mode TOR/LPJ)
                      ============================ */}
                  {role === "Pengaju" && (
                    <>
                      {/* ADMIN */}
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          Catatan dari Admin
                        </p>
                        <textarea
                          className="w-full border rounded-lg p-3 min-h-80 text-gray-400"
                          value={
                            notes[String(activity?.id)]?.[mode]?.admin || ""
                          }
                          placeholder="Belum ada catatan dari Admin..."
                          readOnly
                        />
                      </div>

                      {/* SEKJUR */}
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          Catatan dari Sekjur
                        </p>
                        <textarea
                          className="w-full border rounded-lg p-3 min-h-80 text-gray-400"
                          value={
                            notes[String(activity?.id)]?.[mode]?.sekjur || ""
                          }
                          placeholder="Belum ada catatan dari Sekjur..."
                          readOnly
                        />
                      </div>

                      {/* KAJUR */}
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          Catatan dari Ketua Jurusan
                        </p>
                        <textarea
                          className="w-full border rounded-lg p-3 min-h-80 text-gray-400"
                          value={
                            notes[String(activity?.id)]?.[mode]?.kajur || ""
                          }
                          placeholder="Belum ada catatan dari Kajur..."
                          readOnly
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* SUBMIT FILE */}
            {activeTab === "submit" && (
              <div className="bg-gray-50 rounded-xl shadow-inner">
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
                    role === "Pengaju" ? (
                      // ======================
                      // MODE INPUT khusus PENGAJU
                      // ======================
                      <div className="flex flex-col items-center gap-4 p-10">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow">
                          <span className="text-2xl">⬆️</span>
                        </div>

                        <p className="font-medium text-gray-800">
                          Unggah File {mode === "TOR" ? "TOR" : "LPJ"} di sini
                          atau Telusuri Dokumen
                        </p>
                        <p className="text-xs text-gray-600">
                          Format: PDF (max 10MB)
                        </p>

                        <button
                          type="button"
                          className="mt-2 px-4 py-2 rounded-full bg-white text-sm shadow border cursor-pointer"
                          onClick={() =>
                            document
                              .getElementById(`file-input-${mode}`)
                              ?.click()
                          }
                        >
                          Telusuri Dokumen
                        </button>

                        <input
                          id={`file-input-${mode}`}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleFileChange}
                          aria-label="upload-file"
                        />
                      </div>
                    ) : (
                      // ======================
                      // ROLE LAIN (Admin/Sekjur/Kajur)
                      // ======================
                      <div className="text-center p-10 text-gray-600">
                        Hanya <b>Pengaju</b> yang dapat mengunggah file.
                        <br />
                        Ose cuma bisa melihat atau mengunduh file kalau sudah
                        ada.
                      </div>
                    )
                  ) : (
                    // ======================
                    // FILE SUDAH ADA
                    // ======================
                    <div className="w-full flex justify-center mt-2">
                      <div className="flex items-center justify-between bg-[#A4CEB6] px-8 py-8 rounded-xl shadow-md w-full max-w-[900px]">
                        <p className="text-gray-100 font-semibold text-xl truncate max-w-[65%]">
                          {currentFile.name ?? "—"}
                        </p>

                        <div className="flex items-center gap-3">
                          {/* Tombol Unduh */}
                          <button
                            className="px-6 py-2.5 text-sm rounded-lg bg-[#4957B5] text-white font-semibold tracking-[0.05em] hover:scale-[0.97]"
                            onClick={() => {
                              const url = URL.createObjectURL(currentFile);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = currentFile.name;
                              a.click();
                              URL.revokeObjectURL(url);

                              setHasDownloaded(true);
                            }}
                          >
                            Unduh
                          </button>

                          {/* Tombol Hapus - hanya PENGAJU */}
                          {role === "Pengaju" && (
                            <button
                              aria-label="hapus"
                              className="px-5 py-2 text-sm rounded-lg bg-[#9C1818] text-white hover:scale-[0.97]"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    "Ose yakin mo hapus par data ini ka seng ?"
                                  )
                                )
                                  return;

                                // set state kosong
                                setFiles((prev) => ({
                                  ...prev,
                                  [`${mode}-${id}`]: null,
                                }));

                                localStorage.removeItem(`file-${mode}-${id}`);
                                localStorage.removeItem(
                                  `file-name-${mode}-${id}`
                                );
                              }}
                            >
                              <TrashIcon className="w-6 h-6" />
                            </button>
                          )}
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
