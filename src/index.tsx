import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserPage from "./context/PengajuanContext";
import Dashboard from "./pages/Dashboard";
import DaftarKegiatan from "./pages/DaftarKegiatan";
import Detail from "./pages/Detail";
import DaftarKegiatanLPJ from "./pages/DaftarKegiatanLPJ";
import KelolaDashboard from "./pages/KelolaDashboard";
import { DashboardProvider } from "./context/DashboardContext";
import Profile from "./pages/Profile";
import PengajuanKegiatan from "./pages/PengajuanKegiatan";
import Layout from "./pages/Layout";
import PengajuanContext from "./context/PengajuanContext";


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <DashboardProvider>
      <BrowserRouter>
        <Routes>
          {/* Pagina tanpa layout (ex: login) */}
          <Route path="/" element={<App />} />

          {/* Semua halaman dalam layout */}
          <Route>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<UserPage />} />
            <Route path="/pengajuan" element={<PengajuanContext />} />
            <Route path="/daftar" element={<DaftarKegiatan />} />
            <Route path="/detail" element={<Detail />} />
            <Route path="/daftar-LPJ" element={<DaftarKegiatanLPJ />} />
            <Route path="/kelola" element={<KelolaDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  </React.StrictMode>
);

reportWebVitals();
