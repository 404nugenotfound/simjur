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
    danaDisetujui: number;
    tahun: number;
  };
  danaJurusan: number;
  TotalDanaTerpakai: number;
  approvedDanaTotal: number;
  updateDana: (regular: number, terpakai: number) => void;
  addDanaDisetujui: (nominal: number) => void;
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
    const newKegiatan: Kegiatan = { ...item, id: uuid() ,
      kategori: item.kategori ?? "TOR",
    };
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
        danaDisetujui: Number(parsed.danaDisetujui) || 0,
        tahun: parsed.tahun || new Date().getFullYear(),
      };
    }
  } catch {}

  return {
    danaRegular: 0,
    danaTerpakai: 0,
    danaDisetujui: 0,
    tahun: new Date().getFullYear(),
  };
});

  const addDanaDisetujui = (nominal: number) => {
  setDana((prev) => ({
    ...prev,
    danaDisetujui: prev.danaDisetujui + nominal,
  }));
};


  // Simpan dana ke localStorage setiap kali berubah
  useEffect(() => {
    try {
      localStorage.setItem("dana", JSON.stringify(dana));
    } catch {
      // ignore
    }
  }, [dana]);

  const updateDana = (tambahan: number, terpakai: number) => {
  setDana((prev) => {
    const newDana = {
      ...prev,
      danaRegular: prev.danaRegular + tambahan, // ✅ AKUMULASI
      danaTerpakai: terpakai,
    };

    return newDana;
  });
};


  const approvedDanaTotal = data.reduce((acc, kegiatan) => {
  const key = `approved-dana-${kegiatan.id}`;
  const stored = localStorage.getItem(key);
  return acc + (stored ? Number(stored) : 0);
}, 0);

   const TotalDanaTerpakai = data.reduce((acc, kegiatan) => {
  const danaStr = kegiatan.lpj?.dana_terpakai;
  if (!danaStr) return acc;

  const dana = Number(danaStr.replace(/[^0-9]/g, ""));
  return acc + dana;
}, 0);

const danaJurusan = dana.danaRegular - TotalDanaTerpakai;

  // ====== SUMMARY ======
  const summary = {
    // TOR masuk saat kegiatan dibuat
    totalTor: data.length,

  // LPJ dihitung saat masuk tahap LPJ
   totalLpj: data.filter(
    (d) =>
      d.torApproval1Status === "Approved" &&
      d.torApproval2Status === "Approved" &&
      d.torApproval3Status === "Approved"
  ).length,

  // SELESAI = LPJ APPROVE 3
  totalSelesai: data.filter(
    (d) =>
      d.lpjApproval1Status === "Approved" &&
      d.lpjApproval2Status === "Approved" &&
      d.lpjApproval3Status === "Approved"
  ).length,
};

  return (
    <DashboardContext.Provider
      value={{
        data,
        addKegiatan,
        summary,
        dana,
        updateDana,
        approvedDanaTotal,
        addDanaDisetujui,
        TotalDanaTerpakai,
        danaJurusan,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
