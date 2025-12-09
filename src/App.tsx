import React, { useState } from "react";
import Logo from "./assets/LogoName2.svg";
import Illustration from "./assets/Illustration.svg";
import { UserIcon, KeyIcon } from "@heroicons/react/24/solid";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { roleToName } from "./utils/roleToName";


function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Pengaju");

  // fungsi update role otomatis
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    // Rules sederhana
    let newRole = "Pengaju"; // default kalau ga match
    if (value.toLowerCase() === "admin") newRole = "Admin";
    else if (value.toLowerCase() === "sekjur") newRole = "Sekjur";
    else if (value.toLowerCase() === "kajur") newRole = "Kajur";

    setRole(newRole);
    localStorage.setItem("role", newRole); // optional, langsung save
  };

  const handleLogin = () => {
    const realName = roleToName[role];

    // Simpan nama dalam uppercase
    localStorage.setItem("name", realName.toUpperCase());

    // Simpan role juga kalo perlu
    localStorage.setItem("role", role);
    navigate("/dashboard");
  };

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
              <div className="relative w-3/4">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  {/* Icon user */}
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  className="w-full py-3 px-16 rounded-full bg-white text-gray-700 placeholder-gray-500 focus:outline-none"
                  placeholder="NIM / Email"
                  onChange={handleUsernameChange}
                />
              </div>
              <div className="relative w-3/4">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  {/* Password user */}
                  <KeyIcon className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  className="w-full py-3 px-16 rounded-full bg-white text-gray-700 placeholder-gray-500 focus:outline-none"
                  placeholder="Kata Sandi"
                />
              </div>
              <div className="mr-32 flex justify-center">
                <button
                  className="w-52 py-3 text-xl rounded-full bg-white text-gray-900 font-semibold 
                  hover:bg-gray-800 hover:text-white hover:scale-[0.97] transition-colors duration-100 ease-in-out"
                  onClick={handleLogin}
                >
                  Masuk
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
