import Layout from "./Layout";
import ProfilePic from "../assets/2X.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const storedName = localStorage.getItem("name") || "";
  const [name, setName] = useState(storedName);
  const [email, setEmail] = useState("tik-23@example.com");
  const [nim, setNIM] = useState("123456789");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const navigate = useNavigate();

  return (
    <Layout hideHeader>
      {() => (
        <div className="p-16 py-12">
          <h1 className="text-3xl mb-8 tracking-[0.4rem] font-bebas">
            Profil Pengguna
          </h1>

          <div className="bg-white rounded-xl font-poppins shadow p-6">
            {/* TOP PROFILE SECTION */}
            <div className="flex items-center gap-6 border-b pb-6">
              <img
                src={ProfilePic}
                alt="profile"
                className="w-32 h-32 rounded-lg object-cover"
              />

              <div className="grid grid-cols-[160px_25px_auto] text-gray-700 text-lg gap-y-3">
                <p className="font-medium">Nama</p>
                <p>:</p>
                <p>{name}</p>

                <p className="font-medium">NIM/NIP</p>
                <p>:</p>
                <p>{nim}</p>

                <p className="font-medium">Program Studi</p>
                <p>:</p>
                <p>Teknik Informatika</p>
              </div>
            </div>

            {/* BOTTOM FORMS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-4">
              {/* DATA DIRI */}
              <div className="border rounded-xl p-5">
                <h3 className="text-xl font-semibold mb-4">Data diri</h3>

                <label className="text-sm font-medium">Nama</label>
                <input
                  className="w-full border rounded bg-[#D5D5D5] text-black text-opacity-60 
                  font-medium px-3 py-2 mb-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled
                  aria-label="-"
                />

                <label className="text-sm font-medium">Email</label>
                <input
                  className="w-full border rounded bg-[#D5D5D5] text-black text-opacity-60 
                  font-medium px-3 py-2 mb-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                  aria-label="-"
                />

                <label className="text-sm font-medium">NIM</label>
                <input
                  className="w-full border rounded bg-[#D5D5D5] text-black text-opacity-60 
                  font-medium px-3 py-2 mb-4"
                  value={nim}
                  onChange={(e) => setNIM(e.target.value)}
                  disabled
                  aria-label="-"
                />
              </div>

              {/* GANTI PASSWORD */}
              <div className="border rounded-xl p-5">
                <h3 className="text-xl font-semibold mb-4">Ganti Password</h3>

                <label className="text-sm font-medium">Password Lama</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2 mb-3"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  aria-label="-"
                />

                <label className="text-sm font-medium">Password Baru</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2 mb-4"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  aria-label="-"
                />

                <div className="font-medium grid grid-cols-2 mt-4 gap-4">
                  <button 
                    className="px-4 py-2 rounded bg-blue-600 text-white justify-self-start hover:scale-[0.97]"
                  >
                    Ganti Password
                  </button>

                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white justify-self-end hover:scale-[0.97]"
                    onClick={() => {
                      navigate("/user");
                    }}
                  >
                    ← Kembali
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
