// context/ActivitiesContext.tsx
import { createContext, useState, useContext, ReactNode } from "react";

export type Kegiatan = {
  id: number;
  judul: string;
  tanggal: string;
  deskripsi?: string;
  dana?: string;
  catatanPengaju?: string;
};

type ApprovalStatus = {
  [activityId: string]: {
    approval1Status: "Pending" | "Approved";
    approval2Status: "Pending" | "Approved";
    approval3Status: "Pending" | "Approved";
  };
};

type FilesState = { [key: string]: File | null };

type ContextType = {
  data: Kegiatan[];
  setData: React.Dispatch<React.SetStateAction<Kegiatan[]>>;
  files: FilesState;
  setFiles: React.Dispatch<React.SetStateAction<FilesState>>;
  approvalStatus: ApprovalStatus;
  setApprovalStatus: React.Dispatch<React.SetStateAction<ApprovalStatus>>;
};

const ActivitiesContext = createContext<ContextType | null>(null);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [files, setFiles] = useState<FilesState>({});
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({});

  return (
    <ActivitiesContext.Provider value={{ data, setData, files, setFiles, approvalStatus, setApprovalStatus }}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) throw new Error("useActivities must be used inside ActivitiesProvider");
  return ctx;
}
