import React, { useState } from "react";
import Logo from "./assets/LogoName2.svg";
import Illustration from "./assets/Illustration.svg";
import { UserIcon, KeyIcon } from "@heroicons/react/24/solid";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ApiError } from "./service/api";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
);

// Error message component
const ErrorMessage = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 animate-slideDown">
    <span className="block sm:inline">{message}</span>
    <button 
      onClick={onDismiss}
      className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:bg-red-200 rounded-r"
    >
      <span className="text-red-500 hover:text-red-700 text-xl">&times;</span>
    </button>
  </div>
);

// Development test credentials info
const TestCredentialsInfo = () => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="absolute top-4 right-4 bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs max-w-xs z-50 shadow-lg">
      <h4 className="font-bold text-blue-800 mb-2">🔐 Test Credentials</h4>
      <div className="space-y-2">
        <div className="p-2 bg-blue-100 rounded">
          <p className="font-semibold text-blue-900">Admin (Real API)</p>
          <p className="text-gray-700">Identifier: pengaju</p>
          <p className="text-gray-700">Password: 12345678</p>
          <p className="text-gray-600 text-xs">Role: Admin (ID: 17)</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle login dengan API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!identifier.trim() || !password.trim()) {
      setError("Identifier dan password harus diisi");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(identifier, password);
      
      // Navigate ke dashboard
      navigate("/dashboard");
      
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setError("Identifier atau password salah");
        } else if (err.status === 401) {
          setError("Access denied");
        } else if (err.status === 500) {
          if (err.message.includes("Database query error")) {
            setError("Server sedang bermasalah. Silakan coba beberapa saat lagi.");
          } else {
            setError("Server error. Silakan hubungi administrator.");
          }
        } else {
          setError(err.message || "Login gagal");
        }
      } else if (err instanceof Error) {
        if (err.message.includes('CORS') || err.message.includes('fetch')) {
          setError("API tidak accessible. Pastikan server berjalan.");
        } else {
          setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
        }
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
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
            <form onSubmit={handleLogin} className="mt-16 ml-40 font-poppins space-y-11">
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
                  placeholder="NIM / Email / Username"
                  value={identifier}
                  onChange={handleIdentifierChange}
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
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-white text-gray-900 hover:bg-gray-800 hover:text-white hover:scale-[0.97] active:scale-[0.95]'
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
      
      {/* Development Test Credentials */}
      <TestCredentialsInfo />
    </div>
  );
}

export default App;