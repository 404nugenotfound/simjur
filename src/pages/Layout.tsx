import React from "react";
import Logo from "../assets/LogoWhite.svg";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-80  bg-gradient text-white p-4">
        <div className="flex  items-start gap-1  mb-16">
        <img src={Logo} alt="SIMJUR" className="w-[80px]" />
        <h1 className="text-xl font-orbitron font-extrabold tracking-[0.5rem] mb-10 mt-6">SIMJUR</h1>
        </div>

        <nav className="space-y-4">
          <a href="#" className="flex items-center gap-3 text-lg">
            <span>📊</span> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 text-lg">
            <span>📝</span> Pengajuan Kegiatan
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <button className="text-2xl text-gray-600" aria-label="Open menu">
            {/* <IconTest /> */}
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/avatar.png"
              alt="user"
              className="w-10 h-10 rounded-full"
            />
            <span className="font-semibold">MUHAMMAD FABIAN...</span>
          </div>
        </header>

        {/* Halaman konten */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
