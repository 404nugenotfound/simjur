// src/pages/Detail.tsx
import React, {
  useState,
  useMemo,
  useEffect,
} from "react";
import Layout from "./Layout";
import { useParams, useLocation } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useActivities } from "../context/ActivitiesContext";
import { formatCurrency } from "../utils/formatCurrency";
import DetailPengajuan from "../components/DetailPengajuanSection";
import SubmitFileSection from "../components/SubmitFileSection";
import DanaSetujuSection from "../components/DanaSetujuSection";
import ApprovalAndNoteSection from "../components/ApprovalAndNoteSection";
import { Role, ApprovalField, ApprovalStatus, TabKey } from "@/utils/role";
import TabButton from "../components/TabButton";

import { saveFile } from "../utils/indexedDB";
import { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";


// ----------------- TYPES -----------------
type ApprovalState = {
  approval1Status: ApprovalStatus;
  approval2Status: ApprovalStatus;
  approval3Status: ApprovalStatus;
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

type DetailApprovalData = {
  torApproval1Status?: ApprovalStatus;
  torApproval2Status?: ApprovalStatus;
  torApproval3Status?: ApprovalStatus;
  lpjApproval1Status?: ApprovalStatus;
  lpjApproval2Status?: ApprovalStatus;
  lpjApproval3Status?: ApprovalStatus;
};

interface DetailProps {
  mode?: "TOR" | "LPJ";
}


const Detail: React.FC<DetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { data, setData, approvalStatus, setApprovalStatus } =
    useActivities();
  const [files, setFiles] = useState<Record<string, File | null>>({});

  const [currentNote, setCurrentNote] = useState("");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"detail">("detail");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasFile, setHasFile] = useState<boolean>(false);



  // ---------- INI PART ROLE YA TUANGALA ----------
  const userData = localStorage.getItem("user_data");
  const rawRole = userData ? JSON.parse(userData).roles_id?.toString() : "4";

  const roleTyped: Role =
    rawRole === "1" || rawRole === "2" || rawRole === "3"
      ? rawRole === "1" ? "admin" : rawRole === "2" ? "administrasi" : "pengaju"
      : "pengaju";
  
  const userRole =
    rawRole === "1"
      ? "admin"
      : rawRole === "2"
      ? "administrasi"
      : rawRole === "3"
      ? "pengaju"
      : "pengaju"; // fallback aman

  const mode: "TOR" | "LPJ" = location.state?.type || "TOR";

  const [isDragging, setIsDragging] = useState(false);

  // ---------- MENUNGGU DATA SIAP ----------
  const activity = useMemo(() => {
    if (!data.length || !id) return null;
    return data.find((x) => String(x.id) === id) || null;
  }, [id, data]);

 const currentFile =
  files[`file-${mode}-${activity?.id ?? "noid"}`] ?? null;

  console.log(
    "Detail activity ID:",
    activity?.id,
    "Current file:",
    files[activity?.id || ""]
  );

  // ---------- APPROVED DANA STATE ----------
  const [approvedDana, setApprovedDana] = useState<number | "">("");
  const [isDanaSaved, setIsDanaSaved] = useState(false);
  const { addDanaDisetujui } = useContext(DashboardContext);


  const parseRupiah = (value: string | number) => {
  if (typeof value === "number") return value;
  return Number(value.replace(/[^\d]/g, ""));
};


 const handleSaveDana = () => {
  const mdana = parseRupiah(activity?.dana ?? 0);
  if (!approvedDana || approvedDana <= 0) return;
  if (approvedDana > mdana) return; // ⛔ STOP TOTAL

  // simpan ke localStorage per kegiatan
  const key = `approved-dana-${activity?.id}`;
  localStorage.setItem(key, approvedDana.toString());

  // update context
  addDanaDisetujui(approvedDana);

  setIsDanaSaved(true);
};


  const [detailData, setDetailData] = useState<DetailApprovalData>({});

  const approvalState =
    mode === "TOR"
      ? {
          approval1: detailData.torApproval1Status ?? "Pending",
          approval2: detailData.torApproval2Status ?? "Pending",
          approval3: detailData.torApproval3Status ?? "Pending",
        }
      : {
          approval1: detailData.lpjApproval1Status ?? "Pending",
          approval2: detailData.lpjApproval2Status ?? "Pending",
          approval3: detailData.lpjApproval3Status ?? "Pending",
        };

  const allowedField: ApprovalField =
    mode === "TOR"
      ? roleTyped === "admin"
        ? "torApproval1Status"
        : roleTyped === "administrasi"
        ? "torApproval2Status"
        : "torApproval3Status"
      : roleTyped === "admin"
      ? "lpjApproval1Status"
      : roleTyped === "administrasi"
      ? "lpjApproval2Status"
      : "lpjApproval3Status";


  const detailInfo = {
    nama: activity?.judul ?? "–",
    tanggal: activity?.tanggal ?? "–",
    deskripsi: activity?.deskripsi ?? "Belum ada deskripsi.",
    dana:
    activity?.full?.dana_diajukan ?? activity?.dana ?? "Belum Dilampirkan.",
    penanggung_jawab: activity?.penanggung_jawab ?? "-",
    sisaDana: activity?.lpj?.sisa_dana ?? "-",
    metode_pelaksanaan: activity?.lpj?.metode_pelaksanaan ?? "-",
    total_peserta: activity?.lpj?.total_peserta ?? "[ Belum Ada Data ]",
  };

  const mapFieldToKey = (field: ApprovalField, mode: "TOR" | "LPJ") => {
  if (mode === "TOR") {
    if (field === "torApproval1Status") return "torApproval1Status";
    if (field === "torApproval2Status") return "torApproval2Status";
    return "torApproval3Status";
  } else {
    if (field === "lpjApproval1Status") return "lpjApproval1Status";
    if (field === "lpjApproval2Status") return "lpjApproval2Status";
    return "lpjApproval3Status";
  }
};

const updateAll = (
  field: ApprovalField,
  status: "Approved" | "Rejected" | "Revisi" | "Pending"
) => {
  if (!activity) return;

  const mappedField = mapFieldToKey(field, mode);
  const key = `approval-${activity.id}`;

  const approvalStore = JSON.parse(
    localStorage.getItem("approvalStatus") || "{}"
  );

  const currentModeData =
    approvalStore[key]?.[mode] ??
    (mode === "TOR"
      ? {
          torApproval1Status: "Pending",
          torApproval2Status: "Pending",
          torApproval3Status: "Pending",
        }
      : {
          lpjApproval1Status: "Pending",
          lpjApproval2Status: "Pending",
          lpjApproval3Status: "Pending",
        });

  const updatedModeData = {
    ...currentModeData,
    [mappedField]: status, // ✅ DINAMIS
  };

  const updatedAll = {
    ...approvalStore,
    [key]: {
      ...approvalStore[key],
      [mode]: updatedModeData,
    },
  };

  setApprovalStatus(updatedAll);
  localStorage.setItem("approvalStatus", JSON.stringify(updatedAll));

  setDetailData((prev) => ({
    ...prev,
    ...updatedModeData,
  }));

  setData((prev) => {
    const updated = prev.map((d) =>
      d.id !== activity.id ? d : { ...d, ...updatedModeData }
    );

    localStorage.setItem("kegiatan", JSON.stringify(updated));
    return updated;
  });
};

const removeFile = (
  id: number,
  mode: "TOR" | "LPJ"
) => {
  const key = `file-${id}-${mode}`;

  localStorage.removeItem(key);
};

const resetApprovalToPending = (field: ApprovalField) => {
  if (!activity) return;

  const mappedField = mapFieldToKey(field, mode);
  const key = `approval-${activity.id}`;

  const approvalStore = JSON.parse(
    localStorage.getItem("approvalStatus") || "{}"
  );

  const updatedModeData = {
    ...(approvalStore[key]?.[mode] ?? {}),
    [mappedField]: "Pending",
  };

  const updatedAll = {
    ...approvalStore,
    [key]: {
      ...approvalStore[key],
      [mode]: updatedModeData,
    },
  };

  setApprovalStatus(updatedAll);
  localStorage.setItem("approvalStatus", JSON.stringify(updatedAll));

  setDetailData((prev) => ({
    ...prev,
    ...updatedModeData,
  }));

  setData((prev) => {
    const updated = prev.map((d) =>
      d.id === activity.id ? { ...d, ...updatedModeData } : d
    );
    localStorage.setItem("kegiatan", JSON.stringify(updated));
    return updated;
  });
};

const getApprovalField = (
  mode: "TOR" | "LPJ",
  level: 1 | 2 | 3
): ApprovalField => {
  return `${mode.toLowerCase()}Approval${level}Status` as ApprovalField;
};



const handleApprove = (field: ApprovalField) =>
  updateAll(field, "Approved");

const handleReject = (field: ApprovalField) =>
  updateAll(field, "Rejected");

const handleRevisi = async (field: ApprovalField) => {
  if (!activity || typeof activity.id !== "number") return;

   // 1. ubah status ke Revisi
  await updateAll(field, "Revisi");

  // 2. hapus file biar wajib upload ulang
  removeFile(activity.id, mode);

  // 3. reset flag file
  setHasFile(false);
};


const handleUploadSuccess = async () => {
  if (!activity || typeof activity.id !== "number") return;

  setHasFile(true);

  for (const level of [1, 2, 3] as const) {
    const field = getApprovalField(mode, level);
    resetApprovalToPending(field); // ✅ BUKAN updateAll
  }
};

const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file || !activity || typeof activity.id !== "number") return;

  const key = `file-${mode}-${activity.id}`;
  const nameKey = `file-name-${mode}-${activity.id}`;

  setFiles((prev) => ({
    ...prev,
    [key]: file,
  }));

  // simpan file
  await saveFile(key, file);

  localStorage.setItem(nameKey, file.name);
  localStorage.setItem(`submitted-${mode}-${activity.id}`, "true");

  setHasDownloaded(false);

  // 🔥 RESET APPROVAL KALAU HABIS REVISI
  // 🔥 RESET SEMUA KARENA UPLOAD ULANG
  resetNotes(activity.id, mode);
  await handleUploadSuccess();
};


useEffect(() => {
  if (!activity?.id) return;

  const key = `file-${mode}-${activity?.id}`;
  const nameKey = `file-name-${mode}-${activity?.id}`;

  // Restore status submitted
  const submitted = localStorage.getItem(`submitted-${mode}-${activity?.id}`);
  if (submitted === "true") setHasSubmitted(true);

  // Restore nama file untuk tampilan
  const savedName = localStorage.getItem(nameKey) || "";
  if (savedName) {
    setFiles((prev) => ({
      ...prev,
      [key]: { name: savedName } as any, // placeholder untuk tampilan
    }));
  }
}, [activity?.id, mode]);


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

  const key = `approval-${activity.id}`;
  const store = JSON.parse(localStorage.getItem("approvalStatus") || "{}");
  const saved = store[key]?.[mode] as DetailApprovalData | undefined;

  if (saved) {
    setDetailData((prev) =>
      JSON.stringify(prev) === JSON.stringify(saved) ? prev : saved
    );
    return;
  }

  const defaultData: DetailApprovalData =
    mode === "TOR"
      ? {
          torApproval1Status: "Pending",
          torApproval2Status: "Pending",
          torApproval3Status: "Pending",
        }
      : {
          lpjApproval1Status: "Pending",
          lpjApproval2Status: "Pending",
          lpjApproval3Status: "Pending",
        };

  setDetailData((prev) => {
    const merged = { ...prev, ...defaultData };
    return JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged;
  });
}, [activity, mode]);



  const kegiatanStore = JSON.parse(localStorage.getItem("kegiatan") || "[]");

  const currentKegiatan = kegiatanStore.find(
    (k: any) => String(k.id) === String(activity?.id)
  );

  const danaDiajukan = currentKegiatan?.dana || detailInfo.dana || 0;


  // ===================== STATE CATATAN PER ID =====================
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : {};
  });

  // ===================== LOAD CATATAN SAAT COMPONENT MOUNT =====================
  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, []);

useEffect(() => {
  if (!activity?.id) return;

  const key = `approved-dana-${String(activity.id)}`;
  const saved = localStorage.getItem(key);
  if (!saved) return;

  const savedDana = Number(saved);
  const mdana = parseRupiah(activity.dana ?? 0);

  if (savedDana > 0 && savedDana <= mdana) {
    setApprovedDana(savedDana);
    setIsDanaSaved(true);
  } else {
    localStorage.removeItem(key);
    setApprovedDana("");
    setIsDanaSaved(false);
  }
}, [activity?.id]);

  // ===================== SIMPAN CATATAN PER-ID & PER-ROLE =====================
  const saveNote = (roleType: string, note: string) => {
    if (!activity) return;

    const activityId = String(activity.id);
    const modeKey = mode;

    // ===== UPDATE CATATAN =====
    const updatedNotes = {
      ...notes,
      [activityId]: {
        ...notes[activityId],
        [modeKey]: {
          ...notes[activityId]?.[modeKey],
          [roleType]: note,
        },
      },
    };

    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));

    alert("Catatan revisi dikirim!");
  };

  const resetNotes = (activityId: number, mode: "TOR" | "LPJ") => {
  const stored = JSON.parse(localStorage.getItem("notes") || "{}");

  if (!stored[activityId]) return;

  const updated = {
    ...stored,
    [activityId]: {
      ...stored[activityId],
      [mode]: {
        admin: "",
        sekjur: "",
        kajur: "",
      },
    },
  };

  localStorage.setItem("notes", JSON.stringify(updated));

  // kalau lu punya state notes
  setNotes(updated);
};


  const [hasDownloaded, setHasDownloaded] = useState(false);

  const roleApprovalStatus =
    rawRole === "Admin"
      ? approvalState.approval1
      : rawRole === "Sekjur"
      ? approvalState.approval2
      : rawRole === "Kajur"
      ? approvalState.approval3
      : null;

  const canShowNote = rawRole === "Pengaju" || roleApprovalStatus === "Pending";

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
            <TabButton
              label="Detail"
              value="detail"
              activeTab={activeTab}
              onClick={setActiveTab}
            />

            <TabButton
              label={roleTyped === "pengaju" ? "Submit File" : "Unduh File"}
              value="submit"
              activeTab={activeTab}
              onClick={setActiveTab}
            />

            <TabButton
              label="Status"
              value="approval"
              activeTab={activeTab}
              onClick={setActiveTab}
            />

            {roleTyped === "administrasi" && (
              <TabButton
                label="Dana Disetujui"
                value="danasetuju"
                activeTab={activeTab}
                onClick={setActiveTab}
              />
            )}
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-xl shadow-md mb-6 px-4 py-3 font-poppins">
          <div className="p-4">
            {/* DETAIL */}
            {activeTab === "detail" && (
              <DetailPengajuan activity={activity} detailInfo={detailInfo} />
            )}

            {/* APPROVAL & CATATAN */}
            {activeTab === "approval" && (
              <ApprovalAndNoteSection
                activeTab={activeTab}
                detailInfo={detailInfo}
                approvalState={approvalState}
                allowedField={allowedField}
                hasDownloaded={hasDownloaded}
                handleApprove={(field) => handleApprove(field)}
                handleReject={(field) => handleReject(field)}
                handleRevisi={(field)=> handleRevisi(field)}
                canShowNote={canShowNote}
role={roleTyped}
                 userRole={userRole}
                notes={notes}
                activity={activity}
                mode={mode}
                currentNote={currentNote}
                setCurrentNote={setCurrentNote}
                saveNote={saveNote}
              />
            )}

            {/* SUBMIT FILE */}
            {activeTab === "submit" && (
              <SubmitFileSection
                role={roleTyped}
                mode={mode}
                id={activity?.id}
                onSuccess={handleUploadSuccess}
                currentFile={currentFile}
                hasSubmitted={hasSubmitted}
                isDragging={isDragging}
                handleFileChange={handleFileChange}
                setFiles={setFiles}
                setHasDownloaded={setHasDownloaded}
              />
            )}

            {/* DANA DISETUJUI - SEKJUR */}
            {activeTab === "danasetuju" && (
              <DanaSetujuSection
                dana={danaDiajukan}
                approvedDana={approvedDana}
                isDanaSaved={isDanaSaved}
                formatCurrency={formatCurrency}
                setApprovedDana={setApprovedDana}
                handleSaveDana={handleSaveDana}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Detail;
