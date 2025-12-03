import React from "react";
import Logo from "./assets/LogoName2.svg";
import Illustration from "./assets/Illustration.svg";
import "./App.css";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full h-screen bg-white overflow-hidden shadow-2xl flex">
        {/* LEFT AREA */}
        <div className="w-1/2 p-2 flex flex-col">
          {/* Logo + Text */}
          <div className="flex items-center space-x-[-0.5rem] mb-16">
            <img src={Logo} alt="SIMJUR" className="w-[130px]" />
            <h1 className="text-2xl text-[#285B49] font-orbitron font-black tracking-[0.5rem] leading-tight">
              SIMJUR
            </h1>
          </div>

          {/* Illustration */}
          <div className="flex items-center justify-center mt-8">
            <img
              src={Illustration}
              alt="Illustration"
              className="w-4/5 mb-20"
            />
          </div>
        </div>

        {/* RIGHT AREA */}
        <div className="w-1/2 pt-4 relative flex items-center justify-center">
          {/* Wave Background */}
          <div className="absolute inset-0 bg-gradient clip-wave"></div>

          <div className="relative z-10 text-white px-2 py-14 w-full flex flex-col h-full">
            <div className="pl-40">
              <h1 className="text-7xl pt-20 font-bebas leading-tight">
                SELAMAT DATANG DI —
                <br /> PORTAL SIMJUR
              </h1>

              <p className="text-xl font-poppins text-gray-200 tracking-wider">
                Pengajuan & Laporan Kegiatan
                <span className="font-semibold pl-[6px]">Jurusan</span>
              </p>
            </div>
            <div className="mt-16  ml-40 font-poppins space-y-11">
              <input
                className="w-3/4 py-3 px-6 rounded-full bg-white text-gray-700 placeholder-gray-500 focus:outline-none"
                placeholder="NIM / Email"
              />
              <input
                type="password"
                className="w-3/4 py-3 px-6 rounded-full bg-white text-gray-700 placeholder-gray-500 focus:outline-none"
                placeholder="Password"
              />
              <div className="mr-32 flex justify-center">
                <button
                  className="w-52 py-3 text-xl rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-200 transition"
                  onClick={() => navigate("/dashboard")}
                >
                  Login
                </button>
              </div>
            </div>

            <p className="absolute bottom-5 right-10 text-sm text-gray-200 font-semibold">
              © 2025 SIMJUR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
