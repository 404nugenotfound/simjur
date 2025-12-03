import { createContext, useState, ReactNode } from "react";
import { Kegiatan } from "../types/kegiatan";
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
}

export const DashboardContext = createContext<DashboardContextType>(
  {} as DashboardContextType
);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Kegiatan[]>([]);

  const addKegiatan = (item: Omit<Kegiatan, "id">) => {
    setData((prev) => [...prev, { ...item, id: uuid() }]);
  };

  // ====== STATE DANA ======
  const [dana, setDana] = useState({
    danaRegular: 0,
    danaTerpakai: 0,
    tahun: new Date().getFullYear(),
  });

  const updateDana = (regular: number, terpakai: number) => {
    setDana((prev) => ({
      ...prev,
      danaRegular: regular,
      danaTerpakai: terpakai,
    }));
  };

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
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
