import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import PengajuanKegiatan from "./PengajuanKegiatan";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900">
      {/* Wrapper utama untuk kasih padding dan warna tulisan */}
      <div className="text-white">
      <Layout>
         <h1>Halaman User</h1>
      </Layout>
      </div>
    </div>
  );
}
