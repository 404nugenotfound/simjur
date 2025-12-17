import { Role } from "./role";
export const mapRoleIdToRole = (roles_id: number): Role => {
  const roleMap: Record<number, Role> = {
    1: "Admin",
    2: "Sekjur",
    3: "Kajur",
    4: "Pengaju",
  };
  return roleMap[roles_id] || "Pengaju";
};
export const mapRoleToRoleId = (role: Role): number => {
  const roleMap: Record<Role, number> = {
    Admin: 1,
    Sekjur: 2,
    Kajur: 3,
    Pengaju: 4,
  };
  return roleMap[role] || 4;
};
