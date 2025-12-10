import { useNavigate } from "react-router-dom";
import {
 UserIcon
} from "@heroicons/react/24/solid";
import LogoutIcon from "../assets/Icons/LogoutIcon";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-16 right-6 bg-white shadow-lg border rounded-md w-40 py-2 font-poppins tracking-[0.07rem]"
    >
      <button
        className="flex items-center gap-5 px-5 py-3 hover:bg-gray-100 w-full text-black font-medium"
        onClick={() => {
          close();
          navigate("/profile");
        }}
      >
        <UserIcon className="w-6 h-6" />
        Profil
      </button>

      <button
        className="flex items-center gap-[1.2rem] px-[1.4rem] py-3 hover:bg-gray-100 w-full text-[#9C1818] font-medium"
        onClick={() => {
          close();
          navigate("/");
        }}
      >
        <LogoutIcon className="w-6 h-6" />
        Keluar
      </button>
    </motion.div>
  );
}
