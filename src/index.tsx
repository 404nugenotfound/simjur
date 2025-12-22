import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./pages/Layout";

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <DashboardProvider>
        <ActivitiesProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes (no authentication required) */}
              <Route path="/" element={<App />} />

               {/* Dashboard - All authenticated users */}
              <Route
                path="/dashboard"
                element={
                  <AuthenticatedRoute>
                    <Dashboard />
                  </AuthenticatedRoute>
                }
              />

              {/* Activity Management - Pengaju, Admin, Administrasi */}
              <Route
                path="/pengajuan"
                element={
                  <AuthenticatedRoute>
                    <PengajuanContext />
                  </AuthenticatedRoute>
                }
              />

              <Route
                path="/daftar"
                element={
                  <AuthenticatedRoute>
                    <DaftarKegiatan />
                  </AuthenticatedRoute>
                }
              />

              <Route
                path="/daftar-LPJ"
                element={
                  <AuthenticatedRoute>
                    <DaftarKegiatanLPJ />
                  </AuthenticatedRoute>
                }
              />

              <Route
                path="/detail/:id"
                element={
                  <AuthenticatedRoute>
                    <Detail />
                  </AuthenticatedRoute>
                }
              />

              {/* Financial Management - Admin & Administrasi */}
              <Route
                path="/Input"
                element={
                  <AuthenticatedRoute>
                    <KelolaDana />
                  </AuthenticatedRoute>
                }
              />

              {/* User Management - All authenticated users */}
              <Route
                path="/profile"
                element={
                  <AuthenticatedRoute>
                    <Profile />
                  </AuthenticatedRoute>
                }
              />

              {/* User management page (if needed) */}
              <Route
                path="/user"
                element={
                  <AuthenticatedRoute>
                    <UserPage />
                  </AuthenticatedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ActivitiesProvider>
      </DashboardProvider>
    </AuthProvider>
  </React.StrictMode>,
);

reportWebVitals();
