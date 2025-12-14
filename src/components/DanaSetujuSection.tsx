type Props = {
  danaDiajukan: number | string;
  approvedDana: number | "";
  isDanaSaved: boolean;
  formatCurrency: (value: string) => string;
  setApprovedDana: (value: number) => void;
  handleSaveDana: () => void;
};

const DanaSetujuSection = ({
  danaDiajukan,
  approvedDana,
  isDanaSaved,
  formatCurrency,
  setApprovedDana,
  handleSaveDana,
}: Props) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
      <h2 className="font-semibold mb-4 text-lg">
        Persetujuan Dana (Sekjur)
      </h2>

      {/* DANA DIAJUKAN */}
      <div className="bg-white p-4 rounded-lg border mb-4">
        <p className="text-gray-500">Dana Diajukan</p>
        <p className="font-semibold text-blue-600 text-lg">
          {formatCurrency(String(danaDiajukan))}
        </p>
      </div>

      {/* DANA DISETUJUI */}
      <div className="bg-white p-4 rounded-lg border">
        <p className="text-gray-500 mb-1">Dana Disetujui</p>

        {isDanaSaved ? (
          <p className="font-semibold text-green-600 text-lg">
            {formatCurrency(String(approvedDana))}
          </p>
        ) : (
          <>
            <input
              type="number"
              value={approvedDana}
              onChange={(e) => setApprovedDana(Number(e.target.value))}
              placeholder="Masukkan dana disetujui"
              className="w-full border rounded-md px-3 py-2 mb-3"
            />

            <button
              onClick={handleSaveDana}
              className="px-4 py-2 bg-[#4957B5] text-white rounded tracking-[0.05em] hover:scale-95 transition"
            >
              Simpan Dana
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DanaSetujuSection;
