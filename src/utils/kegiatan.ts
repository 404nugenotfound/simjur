export interface Kegiatan {
  id: string;
  nama: string;
  kategori: "TOR" | "LPJ" | "Selesai";
  nominal: number;
  status: "pending" | "approved" | "done";
}
