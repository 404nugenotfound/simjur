// src/context/ActivitiesContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type Activity = {
  id: string;
  title: string;
  tanggal?: string;
  penanggungJawab?: string;
  deskripsi?: string;
  dana?: string;
  createdAt: string;
  torApproved?: Boolean;
  danaTerpakai?: Number;
};

type AddActivityInput = Omit<Activity, "id" | "createdAt">;

type ContextType = {
  activities: Activity[];
  addActivity: (a: AddActivityInput) => void;
  deleteActivity: (id: string) => void;
  clearActivities: () => void;
};

const ActivitiesContext = createContext<ContextType | undefined>(undefined);

export const ActivitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const raw = localStorage.getItem("activities");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const addActivity = (a: AddActivityInput) => {
    const newAct: Activity = { id: uuidv4(), createdAt: new Date().toISOString(), ...a };
    setActivities(prev => [newAct, ...prev]);
    return newAct;
  };

  const clearActivities = () => setActivities([]);
  const deleteActivity = (id: string) => {
  setActivities((prev) => prev.filter((a) => a.id !== id));
};

  return (
    <ActivitiesContext.Provider value={{ activities, addActivity, clearActivities,deleteActivity, }}>
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) throw new Error("useActivities must be used inside ActivitiesProvider");
  return ctx;
};
