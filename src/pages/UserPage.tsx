import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import PengajuanKegiatan from "./PengajuanKegiatan";

export default function UserPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900">
      {/* Wrapper utama untuk kasih padding dan warna tulisan */}
      <div className="text-white">

        {/* Layout sebagai template/kerangka halaman
          PengajuanKegiatan ditaruh di dalam Layout */}
        <Layout>
          {/* Komponen form/halaman Pengajuan Kegiatan */}
          <PengajuanKegiatan />
        </Layout>
      </div>
    </div>
  );
}
