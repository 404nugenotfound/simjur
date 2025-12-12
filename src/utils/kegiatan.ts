export interface Kegiatan {
  id: string;
  nama: string;
  isTorApproved?: boolean;
  kategori: "TOR" | "LPJ" | "Selesai";
  nominal: number;
  status: "pending" | "approved" | "done";
}
