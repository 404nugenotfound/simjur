// src/pages/Detail.tsx
import React, {
  useState,
  DragEvent,
  ChangeEvent,
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
import TabButton from "../components/TabButton";
import { Role, UserRole, ApprovalField, ApprovalStatus } from "@/utils/role";
import { TabKey } from "@/utils/tab";
import { saveFile } from "../utils/indexedDB";

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
  const [activeTab, setActiveTab] = useState<TabKey>("detail");
  const [hasSubmitted, setHasSubmitted] = useState(false);


  // ---------- INI PART ROLE YA TUANGALA ----------
  const rawRole = localStorage.getItem("role");

  const roleTyped: Role =
    rawRole === "Admin" || rawRole === "Sekjur" || rawRole === "Kajur"
      ? rawRole
      : "Pengaju";

  const userRole: UserRole =
    rawRole === "Admin"
      ? "admin"
      : rawRole === "Sekjur"
      ? "sekjur"
      : rawRole === "Kajur"
      ? "kajur"
      : "admin"; // fallback aman

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

  const handleSaveDana = () => {
    if (!approvedDana || approvedDana <= 0) return;
    const key = `approved-dana-${activity?.id}`;
    localStorage.setItem(key, String(approvedDana));
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
    ? roleTyped === "Admin"
      ? "torApproval1Status"
      : roleTyped === "Sekjur"
      ? "torApproval2Status"
      : "torApproval3Status"
    : roleTyped === "Admin"
    ? "lpjApproval1Status"
    : roleTyped === "Sekjur"
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

const handleApprove = (field: ApprovalField) => {
  if (!activity) return;

  // mapping UI -> field DB
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
    [mappedField]: "Approved",
  };

  const updatedAll = {
    ...approvalStore,
    [key]: {
      ...approvalStore[key],
      [mode]: updatedModeData,
    },
  };

  // ===== SIMPAN STATUS =====
  setApprovalStatus(updatedAll);
  localStorage.setItem("approvalStatus", JSON.stringify(updatedAll));

  // ===== UPDATE STATE LOKAL =====
  setDetailData((prev) => ({
    ...prev,
    ...updatedModeData,
  }));

  // ===== UPDATE DATA KEGIATAN =====
  setData((prev) => {
    const updated = prev.map((d) => {
      if (d.id !== activity.id) return d;

      return {
        ...d,
        ...updatedModeData,
      };
    });

    localStorage.setItem("kegiatan", JSON.stringify(updated));
    return updated;
  });
};

const handleReject = (field: ApprovalField) => {
  if (!activity) return;

  // mapping UI -> field DB
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
    [mappedField]: "Rejected",
  };

  const updatedAll = {
    ...approvalStore,
    [key]: {
      ...approvalStore[key],
      [mode]: updatedModeData,
    },
  };

  // ===== SIMPAN STATUS =====
  setApprovalStatus(updatedAll);
  localStorage.setItem("approvalStatus", JSON.stringify(updatedAll));

  // ===== UPDATE DETAIL =====
  setDetailData((prev) => ({
    ...prev,
    ...updatedModeData,
  }));

  // ===== UPDATE DATA KEGIATAN =====
  setData((prev) => {
    const updated = prev.map((d) => {
      if (d.id !== activity.id) return d;

      return {
        ...d,
        ...updatedModeData,
      };
    });

    localStorage.setItem("kegiatan", JSON.stringify(updated));
    return updated;
  });
};

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !id) return;

  const key = `file-${mode}-${id}`;
  const nameKey = `file-name-${mode}-${id}`;

  setFiles((prev) => ({
    ...prev,
    [key]: file,
  }));

  // Simpan file asli di IndexedDB
  await saveFile(key, file);

  localStorage.setItem(nameKey, file.name);
  localStorage.setItem(`submitted-${mode}-${id}`, "true");
  setHasDownloaded(false);
};


useEffect(() => {
  if (!activity?.id) return;

  const key = `file-${mode}-${activity?.id}`;
  const nameKey = `file-name-${mode}-${activity?.id}`;

  // Restore status submitted
  const submitted = localStorage.getItem(`submitted-${mode}-${activity?.id}`);
  if (submitted === "true") setHasSubmitted(true);

  // Restore nama file untuk tampilan
  const savedName = localStorage.getItem(nameKey);
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
    const key = `approved-dana-${activity?.id}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      setApprovedDana(Number(saved));
      setIsDanaSaved(true);
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
              label={roleTyped === "Pengaju" ? "Submit File" : "Unduh File"}
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

            {roleTyped === "Sekjur" && (
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
                danaDiajukan={danaDiajukan}
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
