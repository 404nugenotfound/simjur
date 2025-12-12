// src/context/DashboardContext.tsx
import { createContext, useState, useEffect, ReactNode } from "react";
import { Kegiatan } from "../utils/kegiatan";
import { v4 as uuid } from "uuid";

interface DashboardContextType {
  data: Kegiatan[];
  addKegiatan: (item: Omit<Kegiatan, "id">) => void;

  summary: {
    totalTor: number;
    totalLpj: number;
    totalSelesai: number;
  };

  dana: {
    danaRegular: number;
    danaTerpakai: number;
    tahun: number;
  };

  updateDana: (regular: number, terpakai: number) => void;
  resetDanaRegular: () => void; // ⬅️ INI YANG BELUM ADA
}

export const DashboardContext = createContext<DashboardContextType>(
  {} as DashboardContextType
);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  // ====== KEGIATAN ======
  const [data, setData] = useState<Kegiatan[]>(() => {
    try {
      const saved = localStorage.getItem("kegiatan");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Simpan kegiatan ke localStorage setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem("kegiatan", JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  const addKegiatan = (item: Omit<Kegiatan, "id">) => {
    const newKegiatan: Kegiatan = { ...item, id: uuid() };
    // update list kegiatan
    setData((prev) => [...prev, newKegiatan]);

    // update dana terpakai otomatis
    setDana((prev) => ({
      ...prev,
      danaTerpakai: prev.danaTerpakai + newKegiatan.nominal,
    }));
  };

  // ====== DANA ======
  const [dana, setDana] = useState(() => {
    try {
      const saved = localStorage.getItem("dana");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          danaRegular: Number(parsed.danaRegular) || 0,
          danaTerpakai: Number(parsed.danaTerpakai) || 0,
          tahun: parsed.tahun || new Date().getFullYear(),
        };
      }
    } catch {}

    return {
      danaRegular: 0,
      danaTerpakai: 0,
      tahun: new Date().getFullYear(),
    };
  });

  // Simpan dana ke localStorage setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem("dana", JSON.stringify(dana));
    } catch {
      // ignore
    }
  }, [dana]);

  const updateDana = (regular: number, terpakai: number) => {
    setDana((prev) => {
      const newDana = {
        ...prev,
        danaRegular: regular,
        danaTerpakai: terpakai,
      };
      return newDana;
    });
  };

  const resetDanaRegular = () => {
  setDana((prev) => ({
    ...prev,
    danaRegular: 0,     // cuma ini yang direset
  }));
};



  // ====== SUMMARY ======
  const summary = {
    totalTor: data.filter((d) => d.kategori === "TOR").length,
    totalLpj: data.filter((d) => d.kategori === "LPJ").length,
    totalSelesai: data.filter((d) => d.kategori === "Selesai").length,
  };

  return (
    <DashboardContext.Provider
      value={{
        data,
        addKegiatan,
        summary,
        dana,
        updateDana,
        resetDanaRegular,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
