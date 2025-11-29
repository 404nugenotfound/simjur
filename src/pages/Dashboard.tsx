import Layout from "./Layout";
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

export default function Dashboard() {
  // Dummy Stats
  const stats = [
    { label: "Total Pengajuan TOR", value: 12 },
    { label: "Total LPJ Disetujui", value: 5 },
    { label: "Kegiatan Selesai Tahun Ini", value: 4 },
  ];

  // Dummy Chart Data
  const chartData = [
    { name: "Total Pengajuan TOR", value: 12 },
    { name: "Total LPJ Disetujui", value: 5 },
    { name: "Kegiatan Selesai Tahun Ini", value: 4 },
  ];

  const COLORS = ["#FF6B6B", "#4CAF50", "#3B82F6"];

  return (
    <div className="bg-gray-900 h-screen text-white">
      <Layout>
        <div className="p-6 h-full overflow-y-auto space-y-8">
          {/* Title */}
          <h1 className="text-3xl text-black font-bebas tracking-[0.4rem] ml-[-1rem]">
            DASHBOARD PENGAJUAN KEGIATAN
          </h1>

          {/* Statistik Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((item, i) => (
              <div
                key={i}
                className="border border-[#D1D1D1] bg-white rounded-xl shadow-md p-5 text-center font-poppins text-black"
              >
                <p className="font-medium">{item.label}</p>
                <p className="text-3xl font-semibold mt-3">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Chart Section 1 */}
          <div className="border bg-white rounded-xl p-6 shadow-md text-black">
            <h2 className="text-lg font-medium font-poppins mb-5">
              Grafik Realisasi Dana Jurusan
            </h2>

            {/* Pie Chart */}
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={chartData} outerRadius={90} label>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Section 2*/}
          <div className="border bg-white rounded-xl p-6 shadow-md text-black">
            <h2 className="text-lg font-medium font-poppins mb-5">
              Grafik Realisasi Dana Jurusan
            </h2>

            {/* Bar Chart */}
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
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
