import React, { useState } from "react";
import Logo from "./assets/LogoName2.svg";
import Illustration from "./assets/Illustration.svg";
import { UserIcon, KeyIcon } from "@heroicons/react/24/solid";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { authApi } from "./service/api";
import { ApiError } from "./service/api";
// Loading spinner component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
);
// Error message component
const ErrorMessage = ({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
    <span className="block sm:inline">{message}</span>
    <button
      onClick={onDismiss}
      className="absolute top-0 bottom-0 right-0 px-4 py-3"
    >
      <span className="text-red-500 hover:text-red-700">&times;</span>
    </button>
  </div>
);
function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Handle login dengan API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username.trim() || !password.trim()) {
      setError("Username dan password harus diisi");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(username, password);

      // Simpan token dan user data
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user_data", JSON.stringify(response.user));

      // Navigate ke dashboard
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setError("Username atau password salah");
        } else if (err.status === 401) {
          setError("Unauthorized access");
        } else if (err.status >= 500) {
          setError("Server error. Silakan coba lagi nanti");
        } else {
          setError(err.message || "Login gagal");
        }
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Handle input changes
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError(null); // Clear error saat user mengetik
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null); // Clear error saat user mengetik
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

            {/* Login Form */}
            <form
              onSubmit={handleLogin}
              className="mt-16 ml-40 font-poppins space-y-11"
            >
              {/* Error Message */}
              {error && (
                <ErrorMessage
                  message={error}
                  onDismiss={() => setError(null)}
                />
              )}
              <div className="relative w-3/4">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
                <input
                  type="text"
                  className="w-full py-3 px-16 rounded-full bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="NIM / Email"
                  value={username}
                  onChange={handleUsernameChange}
                  disabled={isLoading}
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
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="mr-32 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-52 py-3 text-xl rounded-full font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isLoading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-900 hover:bg-gray-800 hover:text-white hover:scale-[0.97] active:scale-[0.95]"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Masuk</span>
                  )}
                </button>
              </div>
            </form>
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
