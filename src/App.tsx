import React, { useState } from "react";
import Logo from "./assets/LogoName2.svg";
import Illustration from "./assets/Illustration.svg";
import { UserIcon, KeyIcon } from "@heroicons/react/24/solid";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ApiError } from "./service/api";
import { Toaster, toast } from "sonner";
// Development test credentials info

function App() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⛔ Validasi input
    if (!identifier.trim() && !password.trim()) {
      toast.warning("Identifier dan password wajib diisi");
      return;
    }

    if (!identifier.trim()) {
      toast.warning("Identifier tidak boleh kosong");
      return;
    }

    if (!password.trim()) {
      toast.warning("Password tidak boleh kosong");
      return;
    }

    // 🔄 Loading toast
    const loadingToast = toast.loading("Sedang memverifikasi akun...");

    try {
      await login(identifier, password);

      // ✅ Success
      toast.success("Login berhasil", {
        id: loadingToast,
      });

      navigate("/dashboard");
    } catch (err) {
      toast.dismiss(loadingToast);

      if (err instanceof ApiError) {
        if (err.status === 400 || err.status === 401) {
          toast.error("Identifier atau password salah");
        } else if (err.status === 500) {
          toast.error(
            err.message.includes("Database")
              ? "Server sedang bermasalah. Silakan coba lagi."
              : "Terjadi kesalahan server",
          );
        } else {
          toast.error(err.message || "Login gagal");
        }
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    }
  };

  // Handle input changes
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Toaster richColors position="bottom-right" />
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

            {/* Login Form */}
            <form
              onSubmit={handleLogin}
              className="mt-16 ml-40 font-poppins space-y-11"
            >
              <div className="relative w-3/4">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type="text"
                  className="w-full py-3 px-16 rounded-full bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="NIM / Email / Username"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="relative w-3/4">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type="password"
                  className="w-full py-3 px-16 rounded-full bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="mr-32 flex justify-center">
                <button
                  type="submit"
                  disabled={!identifier || !password}
                  className={`w-52 py-3 text-xl rounded-full font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    !identifier || !password
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-900 hover:bg-gray-800 hover:text-white hover:scale-[0.97] active:scale-[0.95]"
                  }`}
                >
                  <span>Masuk</span>
                </button>
              </div>
            </form>

            <p className="absolute bottom-5 right-10 text-sm text-gray-200 font-semibold">
              © 2025 SIMJUR
            </p>
          </div>
        </div>
      </div>

      {/* Development Test Credentials */}
      {/*<TestCredentialsInfo />*/}
    </div>
  );
}

export default App;
