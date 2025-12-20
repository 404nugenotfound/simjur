// Role types sesuai API (ID 1-5)
export type Role = 
  | "admin"           // ID: 1 - Administrator penuh
  | "administrasi"    // ID: 2 - Admin administrasi
  | "pengaju"         // ID: 3 - User pengaju proposal
  | "sekretaris"      // ID: 4 - Sekretaris jurusan
  | "ketua_jurusan"; // ID: 5 - Ketua jurusan

export type UserRole = 
  | "admin"           // Sesuai API
  | "administrasi"    // Sesuai API
  | "pengaju"         // Sesuai API
  | "sekretaris"      // Sesuai API
  | "ketua_jurusan"; // Sesuai API

export type TorApprovalField = {
  torApproval1Status?: string;
  torApproval2Status?: string;
  torApproval3Status?: string;
};

export type LpjApprovalField = {
  lpjApproval1Status?: string;
  lpjApproval2Status?: string;
  lpjApproval3Status?: string;
};

/* ===== GABUNGAN ===== */
export type ApprovalField =
  | "torApproval1Status"
  | "torApproval2Status"
  | "torApproval3Status"
  | "lpjApproval1Status"
  | "lpjApproval2Status"
  | "lpjApproval3Status";

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Revisi";

// Role hierarchy untuk permission checking
export const ROLE_HIERARCHY = {
  admin: 5,           // Level paling tinggi
  administrasi: 4,    // Tingkat admin
  ketua_jurusan: 3,  // Ketua jurusan
  sekretaris: 2,      // Sekretaris
  pengaju: 1,         // Level paling rendah
} as const;

// Helper function untuk check role hierarchy
export const canAccess = (userRole: Role, requiredRole: Role): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// TabKey exports untuk consistency
export type TabKey = "detail" | "submit" | "approval" | "danasetuju";

// ================= ROLE ID =================
export type RoleId = 1 | 2 | 3 | 4 | 5;

// mapping string role → roleId
export const ROLE_ID_MAP: Record<Role, RoleId> = {
  admin: 1,
  administrasi: 2,
  pengaju: 3,
  sekretaris: 4,
  ketua_jurusan: 5,
} as const;

