import { createContext, useState, useContext, ReactNode } from "react";

export type Kegiatan = {
  id: string | number;
  judul: string;
  tanggal: string;
  isTorApproved?: boolean;
  dana?: number;
  deskripsi?: string;
  penanggung_jawab?: string;
  catatanPengaju?: string;

  // TOR approvals
  torApproval1Status: string;
  torApproval2Status: string;
  torApproval3Status: string;

  // LPJ approvals
  lpjApproval1Status: string;
  lpjApproval2Status: string;
  lpjApproval3Status: string;

  // catatan jika ada
  torNotes?: string[];
  lpjNotes?: string[];

  full?: Record<string, any>;

  tor?: {
    nomor_tor: string;
    tahun: number;
    dana: number;
    tanggal_mulai: string;
    tanggal_berakhir: string;
    tujuan?: string;
    latar_belakang?: string;
    created_at: string;
  };

  lpj?: {
    metode_pelaksanaan: string;
    dana_terpakai: string;
    sisa_dana: number;
    peserta_mahasiswa: number;
    peserta_alumni: number;
    peserta_dosen: number;
    total_peserta: number;
    created_at: string;
    updated_at?: string;
  };
};

type ApprovalStatus = {
  [activityId: number]: {
    approval1Status: "Pending" | "Approved";
    approval2Status: "Pending" | "Approved";
    approval3Status: "Pending" | "Approved";
  };
};

type FilesState = { [key: number]: File | null };

type ContextType = {
  data: Kegiatan[];
  setData: React.Dispatch<React.SetStateAction<Kegiatan[]>>;
  addData: (item: Kegiatan) => void;
  updateData: (id: string | number, updatedFields: Partial<Kegiatan>) => void;

  selectedActivity: Kegiatan | null;
  setSelectedActivity: React.Dispatch<React.SetStateAction<Kegiatan | null>>;

  files: FilesState;
  setFiles: React.Dispatch<React.SetStateAction<FilesState>>;

  approvalStatus: ApprovalStatus;
  setApprovalStatus: React.Dispatch<React.SetStateAction<ApprovalStatus>>;

  dana: number;
  setDana: React.Dispatch<React.SetStateAction<number>>;

  namaKegiatan: string;
  setNamaKegiatan: React.Dispatch<React.SetStateAction<string>>;

  tahunKegiatan: number;
  setTahunKegiatan: React.Dispatch<React.SetStateAction<number>>;

  kajur: string;
  setKajur: React.Dispatch<React.SetStateAction<string>>;

  penanggungJawab: string;
  setPenanggungJawab: React.Dispatch<React.SetStateAction<string>>;
};

const ActivitiesContext = createContext<ContextType | null>(null);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Kegiatan[]>(() => {
    const saved = localStorage.getItem("kegiatan");
    return saved ? JSON.parse(saved) : [];
  });

  const [files, setFiles] = useState<FilesState>({});
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({});

  const [dana, setDana] = useState<number>(0);
  const [namaKegiatan, setNamaKegiatan] = useState<string>("");
  const [tahunKegiatan, setTahunKegiatan] = useState<number>(
    new Date().getFullYear()
  );
  const [kajur, setKajur] = useState<string>("Bu Anita");
  const [penanggungJawab, setPenanggungJawab] = useState<string>("");
  const [selectedActivity, setSelectedActivity] = useState<Kegiatan | null>(
    null
  );

  const addData = (item: Kegiatan) => {
    const fixedItem: Kegiatan = {
      ...item,

      // Default TOR approvals
      torApproval1Status: item.torApproval1Status || "Pending",
      torApproval2Status: item.torApproval2Status || "Pending",
      torApproval3Status: item.torApproval3Status || "Pending",

      // Default LPJ approvals
      lpjApproval1Status: item.lpjApproval1Status || "Pending",
      lpjApproval2Status: item.lpjApproval2Status || "Pending",
      lpjApproval3Status: item.lpjApproval3Status || "Pending",

      // Default Notes
      torNotes: item.torNotes || [],
      lpjNotes: item.lpjNotes || [],
    };

    setData((prev) => {
      const updated = [...prev, item];
      localStorage.setItem("kegiatan", JSON.stringify(updated));
      return updated;
    });
  };

  const updateData = (
    id: string | number,
    updatedFields: Partial<Kegiatan>
  ) => {
    setData((prev) => {
      const updated = prev.map((item) =>
        String(item.id) === String(id) ? { ...item, ...updatedFields } : item
      );

      localStorage.setItem("kegiatan", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ActivitiesContext.Provider
      value={{
        data,
        setData,
        addData,
        updateData,
        selectedActivity,
        setSelectedActivity,
        files,
        setFiles,
        approvalStatus,
        setApprovalStatus,
        dana,
        setDana,
        namaKegiatan,
        setNamaKegiatan,
        tahunKegiatan,
        setTahunKegiatan,
        kajur,
        setKajur,
        penanggungJawab,
        setPenanggungJawab,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const ctx = useContext(ActivitiesContext);
  if (!ctx)
    throw new Error("useActivities must be used inside ActivitiesProvider");
  return ctx;
}
