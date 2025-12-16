export interface LPJ {
  dana_terpakai?: string;
  peserta_mahasiswa?: number;
  peserta_alumni?: number;
  peserta_dosen?: number;
  total_peserta?: number;
  metode_pelaksanaan?: string;
  sisa_dana?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Kegiatan {
  id: number | string;
  judul: string;
  nama: string;
  isTorApproved?: boolean;
  dana: string;
  tanggal: string;
  penanggung_jawab: string;
  nominal: number;

  torApproval1Status?: "Approved" | "Pending";
  torApproval2Status?: "Approved" | "Pending";
  torApproval3Status?: "Approved" | "Pending";

  lpjApproval1Status?: "Approved" | "Pending";
  lpjApproval2Status?: "Approved" | "Pending";
  lpjApproval3Status?: "Approved" | "Pending";

  lpj?: LPJ;

  kategori?: "TOR" | "LPJ" | "Selesai";
  status?: "pending" | "approved" | "done";
}
