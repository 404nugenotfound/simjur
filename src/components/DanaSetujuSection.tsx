import { useState } from "react";

type Props = {
  dana: number | string;
  approvedDana: number | "";
  isDanaSaved: boolean;
  formatCurrency: (value: string) => string;
  setApprovedDana: (value: number | "") => void;
  handleSaveDana: (approvedDana: number, maxDana: number) => void;
};

/**
 * Parsing aman:
 * - number → langsung
 * - string "1.500.000" → 1500000
 */
const parseNumber = (value: number | string): number => {
  if (typeof value === "number") return value;

  return Number(
    value.replace(/[^0-9]/g, "") // 🔥 buang Rp, titik, koma, spasi, dll
  );
};


const formatRupiah = (value: number | ""): string => {
  if (value === "") return "";
  return `Rp ${value.toLocaleString("id-ID")}`;
};


const DanaSetujuSection = ({
  dana,
  approvedDana,
  isDanaSaved,
  formatCurrency,
  setApprovedDana,
  handleSaveDana,
}: Props) => {
  const [error, setError] = useState("");

  // ⛳ sumber kebenaran tunggal
  const mdana = parseNumber(dana);

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
      <h2 className="font-semibold mb-4 text-lg">Persetujuan Dana (Sekjur)</h2>

      {/* ================= DANA DIAJUKAN ================= */}
      <div className="bg-white p-4 rounded-lg border mb-4">
        <p className="text-gray-500">Dana Diajukan</p>
        <p className="font-semibold text-blue-600 text-lg">
          {formatCurrency(String(dana))}
        </p>
      </div>

      {/* ================= DANA DISETUJUI ================= */}
      <div className="bg-white p-4 rounded-lg border">
        <p className="text-gray-500 mb-1">Dana Disetujui</p>

        {isDanaSaved ? (
          <p className="font-semibold text-green-600 text-lg">
            {formatCurrency(String(approvedDana))}
          </p>
        ) : (
          <>
            <input
              type="text"
              inputMode="numeric"
              value={formatRupiah(approvedDana)}
              placeholder="Masukkan dana yang disetujui"
              className="w-full border rounded-md px-3 py-2 mb-2"
              onChange={(e) => {
                const rawValue = e.target.value;
                const numericValue = parseNumber(rawValue);

                if (rawValue === "") {
                  setApprovedDana("");
                  setError("");
                  return;
                }

                setApprovedDana(numericValue);

                if (numericValue <= 0) {
                  setError("Dana harus lebih dari 0");
                } else if (numericValue > mdana) {
                  setError(
                    "Dana disetujui tidak boleh melebihi dana yang diajukan"
                  );
                } else {
                  setError("");
                }
              }}
            />

            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

            <button
              disabled={
                !!error || approvedDana === "" || Number(approvedDana) <= 0
              }
              onClick={() => {
                const value = Number(approvedDana);

                if (value > mdana) {
                  setError(
                    "Dana disetujui tidak boleh melebihi dana yang diajukan"
                  );
                  return; // ⛔ STOP TOTAL
                }

                handleSaveDana(value, mdana);
              }}
              className={`px-4 py-2 rounded transition
                ${
                  error || approvedDana === "" || Number(approvedDana) <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#4957B5] text-white hover:scale-95"
                }
              `}
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
