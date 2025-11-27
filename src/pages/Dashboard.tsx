import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { PieChart, Pie, Tooltip, Cell } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  // Dummy Stats
  const stats = [
    { label: "Total Pengajuan TOR", value: 12 },
    { label: "Total LPJ Disetujui", value: 5 },
    { label: "Kegiatan Selesai Tahun Ini", value: 4 },
  ];

  // Dummy Chart Data
  const chartData = [
    { name: "Bekerja Part-time", value: 30 },
    { name: "Orang Tua/Wali", value: 60 },
    { name: "Sponsor", value: 10 },
  ];

  const COLORS = ["#ff7373", "#4caf50", "#6ca0ff"];

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="text-white">

        <Layout>
            <div className="p-6">

              <h1 className="text-3xl text-black font-bebas tracking-[0.4rem] ml-[-1rem] mt-3 mb-14">
                DASHBOARD PENGAJUAN KEGIATAN
              </h1>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                {stats.map((item, i) => (
                  <div
                    key={i}
                    className="border border-[#D1D1D1] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.10)] p-4 text-center font-poppins text-gray-900"
                  >
                    <p className="font-medium">{item.label}</p>
                    <p className="text-3xl font-semibold mt-3">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart Section */}
              <div className="border mt-6 p-6 rounded-xl border-[#D1D1D1] shadow-[0_4px_12px_rgba(0,0,0,0.10)] text-black ">
                <h2 className="text-lg font-medium font-poppins mb-4">
                  Grafik Realisasi Dana Jurusan
                </h2>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <PieChart width={350} height={300}>
                    <Pie
                      dataKey="value"
                      data={chartData}
                      fill="#8884d8"
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>

                  {/* Legend */}
                  <ul className="text-sm">
                    {chartData.map((d, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded block"
                          style={{ background: COLORS[i] }}
                        ></span>
                        {d.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
        </Layout>
      </div>
    </div>
  );
}
