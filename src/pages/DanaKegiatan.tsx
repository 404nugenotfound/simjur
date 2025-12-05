  import { useContext, useState } from "react";
  import { DashboardContext } from "../context/DashboardContext";
  import { useNavigate } from "react-router-dom";
  import Layout from "./Layout";

  export default function KelolaDana() {
    const { dana, updateDana, data, resetAll } = useContext(DashboardContext);

    // hitung dana terpakai dari semua kegiatan
    const totalTerpakai = data.reduce(
    (acc, item) => acc + Number(item.nominal || 0),
    0
  );
    // form input untuk dana regular
    const [regular, setRegular] = useState(Number(dana.danaRegular) || 0);  
    const [regularDisplay, setRegularDisplay] = useState(
      dana.danaRegular
        ? new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(dana.danaRegular)
        : ""
    );

    const navigate = useNavigate();

    const formatRupiah = (v: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(v);
    };

    const handleRegularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, "");
    const raw = numbers ? Number(numbers) : 0;

    setRegular(raw);
    setRegularDisplay(raw ? formatRupiah(raw) : "");
  };

    const handleSubmit = () => {
      updateDana(regular, totalTerpakai); // terpakai dihitung otomatis dari kegiatan
      navigate("/dashboard");
    };

  return (
    <Layout>
      <div className="p-12 font-poppins">
        <h1 className="text-3xl font-bebas tracking-[0.4rem] mb-10 text-black">
          Dana Kegiatan (Admin)
        </h1>

        {/* INPUT DANA REGULAR */}
        <div className="border border-gray-300 rounded-xl shadow p-6 bg-white mb-6">
          <label className="block font-medium mb-2">
            Dana Regular (Total BUDGET)
          </label>
          <input
            type="text"
            value={regularDisplay}
            onChange={handleRegularChange}
            placeholder="Rp 0"
            className="border p-3 rounded w-full"
          />
        </div>

        {/* INFO */}
        <div className="bg-gray-100 p-4 rounded-lg shadow mb-6">
          <p className="mb-1">
            Total Dana Terpakai:{" "}
            <b className="text-red-700">{formatRupiah(totalTerpakai)}</b>
          </p>
          <p>
            Sisa Dana:{" "}
            <b className="text-green-700">
              {formatRupiah(regular - totalTerpakai)}
            </b>
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-center gap-5 mt-6 font-medium">
          <button
            onClick={resetAll}
            className="bg-[#9C1818] px-5 py-1.5 rounded-md text-white hover:scale-95 transition"
          >
            Reset
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 px-4 py-1.5 rounded-md text-white hover:scale-95 transition"
          >
            Simpan
          </button>
        </div>
      </div>
    </Layout>
  );
}