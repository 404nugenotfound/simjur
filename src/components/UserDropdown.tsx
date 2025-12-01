import { useNavigate } from "react-router-dom";
import {
 UserIcon
} from "@heroicons/react/24/solid";
import LogoutIcon from "../assets/Icons/LogoutIcon";
import { useEffect, useRef } from "react";

export default function UserDropdown({ close }: { close: () => void }) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  return (
    <div
      ref={dropdownRef}
      className="absolute top-16 right-6 bg-white shadow-lg border rounded-md w-40 py-2 font-poppins tracking-[0.07rem]"
    >
      <button
        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 w-full text-black font-medium"
        onClick={() => {
          close();
          navigate("/profile");
        }}
      >
        <UserIcon className="w-6 h-6" />
        Profile
      </button>

      <button
        className="flex items-center gap-[0.65rem] px-[1.4rem] py-3 hover:bg-gray-100 w-full text-red-500 font-medium"
        onClick={() => {
          close();
          navigate("/");
        }}
      >
        <LogoutIcon className="w-6 h-6" />
        Logout
      </button>
    </div>
  );
}
