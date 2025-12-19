import Layout from "./Layout";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../context/DashboardContext";
import { ParentSize } from "@visx/responsive";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { useActivities } from "../context/ActivitiesContext";
import { useNavigate } from "react-router-dom";
import { roleToName } from "../utils/roleToName";
import PushNotificationComponent from "../components/PushNotificationComponent";

export default function Dashboard() {
  const { summary } = useContext(DashboardContext);

  const stats = [
    {
      label: "Total Pengajuan TOR",
      value: summary?.totalTor ?? 0,
    },
    {
      label: "Total Kegiatan Disetujui",
      value: summary?.totalLpj ?? 0,
    },
    {
      label: "Kegiatan Selesai Tahun Ini",
      value: summary?.totalSelesai ?? 0,
    },
  ];

  // Data Dana dari context
  const { dana, approvedDanaTotal, TotalDanaTerpakai, danaJurusan } =
    useContext(DashboardContext);

  const danaStats = [
    {
      label: "Dana dari Jurusan: ",
      value: danaJurusan, // NUMBER
      display: `Rp ${danaJurusan.toLocaleString()}`,
    },
    {
      label: "Total Dana yang Disetujui: ",
      value: approvedDanaTotal,
      display: `Rp ${approvedDanaTotal.toLocaleString()}`,
    },
    {
      label: "Total Dana yang Terpakai: ",
      value: TotalDanaTerpakai,
      display: `Rp ${TotalDanaTerpakai.toLocaleString()}`,
    },
  ];

  const pieData = [
    {
      label: "Terpakai",
      value: TotalDanaTerpakai,
      color: "#38408fff",
    },
    {
      label: "Dana Disetujui",
      value: approvedDanaTotal,
      color: "#6771c9ff",
    },
    {
      label: "Dana Jurusan",
      value: danaJurusan,
      color: "#5fa251ff",
    },
  ];
  const [activeSlice, setActiveSlice] = useState(pieData[0]);

  const { data } = useActivities();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 5;
  const navigate = useNavigate();
  const namaPengaju = roleToName["pengaju"];

  // === FILTER + SORT UTAMA ===
  const filtered = [...data]      // clone dulu biar aman
    .reverse()                    // urutan terbaru paling atas
    .filter((item) => {
      const matching = filter === "all" ? true : item.judul === filter;
      const searching = item?.judul?.toLowerCase()?.includes(search.toLowerCase()) ?? false;
      return matching && searching;
    });
  
  
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
  
    const paginatedData = filtered.slice(startIndex, endIndex);
  
     useEffect(() => {
        setPage(1);
      }, [search]);
  
    {
      /* Tabel */
    }

  return (
    <Layout>
      <div className="flex-1 p-6 md:p-12 transition-all duration-300 space-y-8 font-poppins">
        <h1 className="text-3xl text-black font-bebas tracking-[0.4rem] ml-[-1rem] mt-3 mb-12">
          DASHBOARD PENGAJUAN KEGIATAN
        </h1>

        {/* Push Notification Component */}
        <PushNotificationComponent />

        {/* ====== CARD DANA ====== */}
        <div className="border bg-white rounded-xl p-6 shadow-md text-black mt-6">
          <h2 className="text-lg font-medium mb-10">
            Grafik Perbandingan Dana Tahun {dana.tahun}
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* ===== KIRI: PIE CHART ===== */}
            <div className="flex-1 flex justify-center items-center h-[320px] ml-16">
              <ParentSize>
                {({ width, height }) => {
                  const size = Math.min(width, height);
                  const radius = size / 2;
                  const innerRadius = radius - 28;

                  return (
                    <svg width={size} height={size}>
                      <Group top={size / 2} left={size / 2}>
                        <Pie
                          data={pieData}
                          pieValue={(d) => d.value}
                          outerRadius={radius}
                          innerRadius={innerRadius}
                          padAngle={0.02}
                        >
                          {(pie) =>
                            pie.arcs.map((arc, i) => (
                              <path
                                key={i}
                                d={pie.path(arc) || undefined}
                                fill={arc.data.color}
                                className="cursor-pointer transition-all hover:opacity-80"
                                onClick={() => setActiveSlice(arc.data)}
                              />
                            ))
                          }
                        </Pie>

                        {/* TEXT TENGAH */}
                        <text
                          textAnchor="middle"
                          dy="-0.2em"
                          fontSize={22}
                          fontWeight={600}
                        >
                          Rp. {activeSlice.value.toLocaleString()}
                        </text>
                        <text
                          textAnchor="middle"
                          dy="1.4em"
                          fontSize={14}
                          fill={activeSlice.color}
                        >
                          {activeSlice.label}
                        </text>
                      </Group>
                    </svg>
                  );
                }}
              </ParentSize>
            </div>

            {/* ===== TENGAH: SEPARATOR ===== */}
            <div className="hidden lg:block h-[280px] border-l-2 border-dashed border-gray-300" />

            {/* ===== KANAN: INFO DANA ===== */}
            <div className="flex-1 w-full max-w-[420px] space-y-5 mr-12">
              {danaStats.map((item, i) => (
                <div
                  key={i}
                  className="
                  grid grid-cols-[1fr_auto]
                  items-center
                  bg-gray-50
                  rounded-2xl
                  px-6 py-5
                  border
                "
                >
                  {/* LABEL */}
                  <span className="text-gray-600 font-medium leading-snug">
                    {item.label}
                  </span>

                  {/* ANGKA */}
                  <span className="text-black font-semibold text-lg text-right whitespace-nowrap">
                    {item.display}
                  </span>
                </div>
              ))}
            </div>
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
        {/* ====== DAFTAR KEGIATAN (VERSI DASHBOARD) ====== */}
        <div className="border border-[#D1D1D1] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.10)] p-6">
          <h2 className="text-lg font-medium mb-10">
            Daftar Kegiatan yang Diajukan Tahun {dana.tahun}
          </h2>
          {/* Tabel */}
          <div className="border rounded-lg overflow-hidden font-poppins">
            <table className="w-full text-left">
              <thead className="bg-[#86BE9E] text-white tracking-[0.1em] font-semibold">
                <tr className="text-center [&>th]:font-semibold">
                  <th className="px-4 p-3">No</th>
                  <th className="px-4 p-3">Nama Pengaju</th>
                  <th className="px-4 p-3">Judul Kegiatan</th>
                  <th className="px-4 p-3">Tanggal Diajukan</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b text-[#696868] text-center"
                    >
                      <td className="p-3">{startIndex + index + 1}</td>
                      <td className="p-3">{namaPengaju}</td>
                      <td className="p-3 font-semibold">{item.judul}</td>
                      <td className="p-3">{item.tanggal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end text-black gap-2 mt-3 mr-3.5 font-poppins font-semibold">
            <button
              className="px-2 py-1 border rounded border-[C4C3C3] shadow-[0_4px_12px_rgba(0,0,0,0.20)] "
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              {"<"}
            </button>

            <span className="px-3 py-1 border rounded border-[C4C3C3] shadow-[0_4px_12px_rgba(0,0,0,0.20)]">
              {page}
            </span>

            <button
              className="px-2 py-1 border rounded border-[C4C3C3] shadow-[0_4px_12px_rgba(0,0,0,0.20)]"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(filtered.length / limit)}
            >
              {">"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
