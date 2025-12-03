import Layout from "./Layout";
import { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import LineChart from "../components/Charts/LineChart";

export default function Dashboard() {
  const { summary } = useContext(DashboardContext);

const stats = [
  { label: "Total Pengajuan TOR", value: summary?.totalTor ?? 0 },
  { label: "Total Kegiatan Disetujui", value: summary?.totalLpj ?? 0 },
  { label: "Kegiatan Selesai Tahun Ini", value: summary?.totalSelesai ?? 0 },
];

const generateDateData = (tor: number[], lpj: number[], selesai: number[]) => {
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
  const { dana } = useContext(DashboardContext);

  const danaSisa = dana.danaRegular - dana.danaTerpakai;

  const danaStats = [
    { label: "Dana Regular", value: `Rp ${dana.danaRegular.toLocaleString()}` },
    {
      label: "Dana Terpakai",
      value: `Rp ${dana.danaTerpakai.toLocaleString()}`,
    },
    { label: "Dana Sisa", value: `Rp ${danaSisa.toLocaleString()}` },
  ];

  const danaChart = [
    { name: "Terpakai", value: dana.danaTerpakai },
    { name: "Sisa", value: danaSisa },
  ];


  return (
    <div className="text-white">
      <Layout>
        <div className="p-12 h-full overflow-y-auto space-y-8">
          <h1 className="text-3xl text-black font-bebas tracking-[0.4rem]">
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
                <p className="font-medium">{item.label}</p>
                <p className="text-3xl font-bold mt-3">{item.value}</p>
              </div>
            ))}
          </div>

          {/* ====== PIE CHART DANA ====== */}
          <div className="border bg-white rounded-xl p-6 shadow-md text-black mt-6">
            <h2 className="text-lg font-medium mb-5">
              Grafik Dana (Terpakai vs Sisa)
            </h2>
            <div className="w-full h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie dataKey="value" data={danaChart} outerRadius={90} label>
                    <Cell fill="#FF6B6B" />
                    <Cell fill="#4CAF50" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((item, i) => (
              <div
                key={i}
                className="border bg-white rounded-xl p-5 text-center text-black"
              >
                <p className="font-medium">{item.label}</p>
                <p className="text-3xl font-bold mt-3">{item.value}</p>
              </div>
            ))}
          </div>

          {/* BAR CHART */}
          <div className="border bg-white rounded-xl p-6 shadow-md text-black">
            <h2 className="text-lg font-medium mb-5">Grafik Perbandingan</h2>
            <LineChart chartData={chartData} />
          </div>
        </div>
      </Layout>
    </div>
  );
}
