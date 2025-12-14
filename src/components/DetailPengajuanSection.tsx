import React from "react";


type Props = {
  activity: any;
  detailInfo: any;
};

const DetailPengajuan = ({ activity, detailInfo }: Props) => {

  const approvedDanaKey = React.useMemo(() => {
    if (!activity?.id) return null;
    return `approved-dana-${activity.id}`;
  }, [activity?.id]);

  const storedApprovedDana = React.useMemo(() => {
    if (!approvedDanaKey) return null;
    return localStorage.getItem(approvedDanaKey);
  }, [approvedDanaKey]);

  const formatCurrency = (value: string | number) => {
    const numbersOnly = String(value).replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(numbersOnly));
  };

  const approvedDanaDisplay = storedApprovedDana
    ? formatCurrency(storedApprovedDana)
    : "-";
  
    return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
      <h2 className="font-semibold mb-4 text-lg">Detail Pengajuan</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Nama Kegiatan</p>
          <p className="font-medium">{detailInfo.nama}</p>
        </div>

        <div>
          <p className="text-gray-500">Tanggal Pengajuan</p>
          <p className="font-medium">{detailInfo.tanggal}</p>
        </div>

        <div>
          <p className="text-gray-500">Penanggung Jawab</p>
          <p className="font-medium">{detailInfo.penanggung_jawab}</p>
        </div>

        <div>
          <p className="text-gray-500">Dana Diajukan</p>
          <p className="font-medium">{detailInfo.dana}</p>
        </div>

        <div>
          <p className="text-gray-500">Jumlah Peserta</p>
          <p className="font-medium">
            {detailInfo.total_peserta} peserta
          </p>
        </div>

        <div>
          <p className="text-gray-500">Dana Disetujui</p>
          <p className="font-medium">{approvedDanaDisplay}</p>
        </div>

        <div>
          <p className="text-gray-500">Metode Pelaksanaan</p>
          <p className="font-medium">
            {detailInfo.metode_pelaksanaan}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Dana Tersisa</p>
          <p className="font-medium">
            {formatCurrency(String(detailInfo.sisaDana || 0))}
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm">
        <p className="text-gray-500 mb-1">Deskripsi</p>
        <p className="leading-relaxed font-medium">
          {detailInfo.deskripsi}
        </p>
      </div>
    </div>
  );
};

export default DetailPengajuan;
