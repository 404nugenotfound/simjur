import { Role } from "./role";
export const mapRoleIdToRole = (roles_id: number): Role => {
  const roleMap: Record<number, Role> = {
    1: "Pengaju",
    2: "Admin",
    3: "Sekjur", 
    4: "Kajur",
  };
  return roleMap[roles_id] || "Pengaju";
};
export const mapRoleToRoleId = (role: Role): number => {
  const roleMap: Record<Role, number> = {
    Pengaju: 1,
    Admin: 2,
    Sekjur: 3,
    Kajur: 4,
  };
  return roleMap[role] || 1;
};
