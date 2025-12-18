import Profile from "../assets/2X.svg";
import { useState } from "react";
import UserDropdown from "./UserDropdown";

const getDataApi = () => {
  const userSTR = localStorage.getItem("user");
  return userSTR ? JSON.parse(userSTR) : null;
};

export default function HeaderBar() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [name, setName] = useState(getDataApi()?.name || "");

  // Ambil nama dari localStorage
  const userData = localStorage.getItem("user_data");
  const userName = userData ? JSON.parse(userData).name : "USER";

  return (
    <header className="flex items-center justify-end bg-white shadow relative">
      <div></div>
      <div
        className="
            relative flex items-center gap-3 cursor-pointer
            px-5 py-5
            border border-transparent
            hover:border-gray-300 hover:bg-gray-100 transition
            "
        onClick={() => setOpenDropdown(!openDropdown)}
      >
        {/* Separator */}
        <div className="absolute left-[-0.2rem] top-[-1px] bottom-[-1px] w-[2px] bg-gray-300"></div>

        {/* Foto */}
        <img src={Profile} alt="user" className="w-10 h-10 ml-2 rounded-full" />

        {/* Nama */}
        <span className="font-semibold font-poppins text-black max-w-[201px] pl-1 pr-3 truncate">
          {name}
        </span>
      </div>

      {openDropdown && <UserDropdown close={() => setOpenDropdown(false)} />}
    </header>
  );
}
