import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import PengajuanKegiatan from "./PengajuanKegiatan";

export default function UserPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900">
      {/* Wrapper utama untuk kasih padding dan warna tulisan */}
      <div style={{color: "white" }}>

        {/* Layout sebagai template/kerangka halaman
          PengajuanKegiatan ditaruh di dalam Layout */}
        <Layout>
          {/* Komponen form/halaman Pengajuan Kegiatan */}
          <PengajuanKegiatan />
        </Layout>

        {/* Tombol untuk kembali ke halaman login */}
        <button
          onClick={() => navigate("/")} // event klik
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}
