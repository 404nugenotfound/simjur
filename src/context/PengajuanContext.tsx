import Layout from "../pages/Layout";
import PengajuanKegiatan from "../pages/PengajuanKegiatan";

export default function PengajuanContext() {
  return (
    <Layout>
      {(mode, setMode) => <PengajuanKegiatan mode={mode} setMode={setMode} />}
    </Layout>
  );
}
