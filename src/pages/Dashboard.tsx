import Layout from "./Layout";
import { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";
import { ResponsiveContainer } from "recharts";
import LineChart from "../components/Charts/LineChart";
import VisxPieResponsive from "../components/Charts/VisxPieResponsive";

export default function Dashboard() {
  const { summary } = useContext(DashboardContext);

  const stats = [
    { label: "Total Pengajuan TOR", value: summary?.totalTor ?? 0 },
    { label: "Total Kegiatan Disetujui", value: summary?.totalLpj ?? 0 },
    { label: "Kegiatan Selesai Tahun Ini", value: summary?.totalSelesai ?? 0 },
  ];

  const generateDateData = (
    tor: number[],
    lpj: number[],
    selesai: number[]
  ) => {
    const today = new Date();
    const currentMonth = today.toLocaleString("id-ID", { month: "short" });

    return tor.map((_, i) => ({
      date: `${String(i + 1).padStart(2, "0")} ${currentMonth}`,
      tor: tor[i],
      lpj: lpj[i],
      selesai: selesai[i],
    }));
  };

  const generateSmoothHistory = (value: number, length = 7) => {
    if (value === 0) return Array(length).fill(0);

    let progress: number[] = [];
    let current = 0;
    const step = value / length;

    for (let i = 0; i < length; i++) {
      current += step;
      progress.push(Math.round(Math.min(current, value)));
    }

    return progress;
  };

  const chartData = generateDateData(
    generateSmoothHistory(summary?.totalTor ?? 0),
    generateSmoothHistory(summary?.totalLpj ?? 0),
    generateSmoothHistory(summary?.totalSelesai ?? 0)
  );

  // Data Dana dari context
  const { dana, approvedDanaTotal, TotalDanaTerpakai, danaJurusan } =
    useContext(DashboardContext);

  const danaStats = [
    { label: "Dana dari Jurusan", value: `Rp ${danaJurusan.toLocaleString()}` },
    {
      label: "Total Dana yang Disetujui",
      value: `Rp ${approvedDanaTotal.toLocaleString()}`,
    },
    {
      label: "Total Dana yang Terpakai",
      value: `Rp ${TotalDanaTerpakai.toLocaleString()}`,
    },
  ];


  return (
    <Layout>
      <div className="flex-1 p-6 md:p-12 transition-all duration-300 space-y-8 font-poppins">
        <h1 className="text-3xl text-black font-bebas tracking-[0.4rem] ml-[-1rem] mt-3 mb-12">
          DASHBOARD PENGAJUAN KEGIATAN
        </h1>

        {/* ====== CARD DANA ====== */}
        <h2 className="text-xl text-black font-semibold mt-10 mb-3">
          DANA TAHUN {dana.tahun}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {danaStats.map((item, i) => (
            <div
              key={i}
              className="border bg-white rounded-xl p-5 text-center text-black shadow"
            >
              <p className="font-medium text-lg">{item.label}</p>
              <p className="text-3xl font-semibold mt-3">{item.value}</p>
            </div>
          ))}
        </div>

        {/* ====== PIE CHART DANA ====== */}
        <div className="border bg-white rounded-xl p-6 shadow-md text-black mt-6">
          <h2 className="text-lg font-medium mb-5">Grafik Dana Jurusan</h2>

          {/* Wrapper fleksibel */}
          <div className="w-full h-72 flex-1">
              <VisxPieResponsive />
          </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {stats.map((item, i) => (
            <div
              key={i}
              className="border bg-white rounded-xl p-5 text-center text-black shadow"
            >
              <p className="font-medium">{item.label}</p>
              <p className="text-3xl font-bold mt-3">{item.value}</p>
            </div>
          ))}
        </div>

        {/* BAR CHART */}
        <div className="border bg-white rounded-xl p-6 shadow-md text-black mt-6">
          <h2 className="text-lg font-medium mb-5">Grafik Perbandingan</h2>
          <div className="w-full h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart chartData={chartData} />
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
