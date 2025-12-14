export type Role = "Admin" | "Sekjur" | "Kajur" | "Pengaju";
export type UserRole = "admin" | "sekjur" | "kajur";

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
