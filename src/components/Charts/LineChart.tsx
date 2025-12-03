import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

interface LineChartProps {
  chartData: { date: string; tor: number; lpj: number; selesai: number }[];
}

export default function LineChart({ chartData }: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const options = {
      chart: {
        type: "line",
        height: 280,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
      },

      stroke: {
        curve: "smooth",
        width: 3,
      },

      markers: {
        size: 5,
        strokeWidth: 2,
        hover: { size: 7 },
      },

      series: [
        {
          name: "TOR",
          data: chartData.map((d) => d.tor),
        },
        {
          name: "LPJ",
          data: chartData.map((d) => d.lpj),
        },
        {
          name: "Selesai",
          data: chartData.map((d) => d.selesai),
        },
      ],

      xaxis: {
        categories: chartData.map((d) => d.date),
        labels: {
          style: { colors: "#8F9BB3", fontSize: "12px" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: {
        labels: {
          style: { colors: "#8F9BB3" },
        },
      },

      grid: {
        borderColor: "#2C3245",
        strokeDashArray: 5,
      },

      tooltip: {
        theme: "dark",
      },

      colors: ["#3366FF", "#9BA4B5", "#00C49F"], // Biru, Abu, Hijau
      legend: {
        position: "top",
        labels: { colors: "#fff" },
      },
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();

    return () => chart.destroy();
  }, [chartData]);

  return <div ref={chartRef} />;
}
