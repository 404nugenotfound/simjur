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
import { DashboardProvider } from "./context/DashboardContext";
import Profile from "./pages/Profile";
import PengajuanContext from "./context/PengajuanContext";
import { ActivitiesProvider } from "./context/ActivitiesContext";
import KelolaDana from "./pages/DanaKegiatan";


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <DashboardProvider>
      <ActivitiesProvider>
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
              <Route path="/detail/:id" element={<Detail />} />
              <Route path="/daftar-LPJ" element={<DaftarKegiatanLPJ />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/Input" element={<KelolaDana />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ActivitiesProvider>
    </DashboardProvider>
  </React.StrictMode>
);

reportWebVitals();
