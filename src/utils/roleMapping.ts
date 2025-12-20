import { Role } from "./role";

/**
 * Mapping Role ID dari API ke Role types
 * API Roles (sesuai response API):
 * 1: admin
 * 2: administrasi  
 * 3: pengaju
 * 4: sekretaris
 * 5: ketua_jurusan
 */
export const mapRoleIdToRole = (roles_id: number): Role => {
  const roleMap: Record<number, Role> = {
    1: "admin",           // Administrator penuh
    2: "administrasi",     // Admin administrasi
    3: "pengaju",         // User pengaju proposal
    4: "sekretaris",       // Sekretaris jurusan
    5: "ketua_jurusan",   // Ketua jurusan
  };
  
  // Default ke pengaju jika tidak ditemukan
  return roleMap[roles_id] || "pengaju";
};

export const mapRoleToRoleId = (role: Role): number => {
  const roleMap: Record<Role, number> = {
    admin: 1,              // ID: 1
    administrasi: 2,        // ID: 2
    pengaju: 3,             // ID: 3
    sekretaris: 4,          // ID: 4
    ketua_jurusan: 5,        // ID: 5
  };
  
  // Default ke pengaju (ID: 3) jika tidak ditemukan
  return roleMap[role] || 3;
};
