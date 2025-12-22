"use client";

import React from "react";
import { TabKey } from "@/utils/tab";

type TabButtonProps = {
  label: string;
  value: TabKey;
  activeTab: TabKey;
  onClick: (value: TabKey) => void;
};

const TabButton = ({ label, value, activeTab, onClick }: TabButtonProps) => {
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`text-lg font-semibold tracking-wide px-6 py-2 rounded-md transition-all
        ${
          isActive
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-indigo-600 hover:text-[#6C74C6]"
        }
      `}
    >
      {label}
    </button>
  );
};

export default TabButton;
