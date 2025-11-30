import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserPage from "./pages/UserPage";
import Dashboard from "./pages/Dashboard";
import DaftarKegiatan from "./pages/DaftarKegiatan";
import Detail from "./pages/Detail";
import DaftarKegiatanLPJ from "./pages/DaftarKegiatanLPJ";
import { DashboardProvider } from "./context/DashboardContext"; // ⬅ tambahan
import KelolaDashboard from "./pages/KelolaDashboard";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <DashboardProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/daftar" element={<DaftarKegiatan />} />
          <Route path="/detail" element={<Detail />} />
          <Route path="/daftar-LPJ" element={<DaftarKegiatanLPJ />} />
          <Route path="/kelola" element={<KelolaDashboard />} />
        </Routes>
      </BrowserRouter>
    </DashboardProvider>
  </React.StrictMode>
);

reportWebVitals();
