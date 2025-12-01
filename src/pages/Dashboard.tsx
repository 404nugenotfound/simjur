import Layout from "./Layout";
import { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";
import {
  PieChart, Pie, Tooltip, Cell,
  ResponsiveContainer, Legend, BarChart,
  Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

export default function Dashboard() {
  const { summary } = useContext(DashboardContext);

  const stats = [
    { label: "Total Pengajuan TOR", value: summary.totalTor },
    { label: "Total LPJ Disetujui", value: summary.totalLpj },
    { label: "Kegiatan Selesai Tahun Ini", value: summary.totalSelesai },
  ];

  const chartData = [
    { name: "TOR", value: summary.totalTor },
    { name: "LPJ", value: summary.totalLpj },
    { name: "Selesai", value: summary.totalSelesai },
  ];

  const COLORS = ["#FF6B6B", "#4CAF50", "#3B82F6"];

  return (
    <div className="text-white">
      <Layout>
        <div className="p-12 h-full overflow-y-auto space-y-8">
          <h1 className="text-3xl text-black font-bebas tracking-[0.4rem]">
            DASHBOARD PENGAJUAN KEGIATAN
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((item, i) => (
              <div key={i} className="border bg-white rounded-xl p-5 text-center text-black">
                <p className="font-medium">{item.label}</p>
                <p className="text-3xl font-bold mt-3">{item.value}</p>
              </div>
            ))}
          </div>

          {/* PIE CHART */}
          <div className="border bg-white rounded-xl p-6 shadow-md text-black">
            <h2 className="text-lg font-medium mb-5">Grafik Data Kegiatan</h2>
            <div className="w-full h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie dataKey="value" data={chartData} outerRadius={90} label>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BAR CHART */}
          <div className="border bg-white rounded-xl p-6 shadow-md text-black">
            <h2 className="text-lg font-medium mb-5">Grafik Perbandingan</h2>
            <div className="w-full h-72">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}
