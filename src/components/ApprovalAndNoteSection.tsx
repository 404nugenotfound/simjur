import { ApprovalField } from "@/utils/role";


type Role = "Admin" | "Sekjur" | "Kajur" | "Pengaju";
type UserRole = "admin" | "sekjur" | "kajur";

type ApprovalStateUI = {
  approval1: "Pending" | "Approved" | "Rejected" | "Revisi";
  approval2: "Pending" | "Approved" | "Rejected" | "Revisi";
  approval3: "Pending" | "Approved" | "Rejected" | "Revisi";
};

type Props = {
  activeTab: string;
  detailInfo: any;

  approvalState: ApprovalStateUI;

  allowedField: ApprovalField;
  hasDownloaded: boolean;

  handleApprove: (field: ApprovalField) => void;
  handleReject: (field: ApprovalField) => void;

  canShowNote: boolean;

  role: Role;
  userRole: UserRole;

  notes: any;
  activity: any;
  mode: "TOR" | "LPJ";

  currentNote: string;
  setCurrentNote: (val: string) => void;
  saveNote: (role: UserRole, note: string) => void;
};

const ApprovalAndNoteSection = ({
  activeTab,
  detailInfo,
  approvalState,
  allowedField,
  hasDownloaded,
  handleApprove,
  handleReject,
  canShowNote,
  role,
  userRole,
  notes,
  activity,
  mode,
  currentNote,
  setCurrentNote,
  saveNote,
}: Props) => {
  if (activeTab !== "approval") return null;

  const renderStatus = (status: string) => {
  if (status === "Approved")
    return <span className="text-green-600 font-semibold">Disetujui ✔</span>;
  if (status === "Rejected")
    return <span className="text-red-600 font-semibold">Ditolak ✖</span>;
  if (status === "Revisi")
    return <span className="text-orange-600 font-semibold">Revisi ✎</span>;

  return <span className="text-gray-500">Pending</span>;
};

  const renderAction = (field: ApprovalField, status: string) => {
  if (
    ["Pending", "Revisi"].includes(status) &&
    allowedField === field
  ) {
    return (
      <div className="flex gap-2 justify-center mt-1">
        <button
          onClick={() => handleApprove(field)}
          className="px-2 py-1 text-xs bg-green-600 text-white rounded"
        >
          Setujui
        </button>
        <button
          onClick={() => handleReject(field)}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
        >
          Tolak
        </button>
      </div>
    );
  }
  return null;
};


  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
      <h2 className="font-semibold mb-4 text-lg">Status Persetujuan</h2>

      {/* ================= TABLE APPROVAL ================= */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm text-gray-500">
          <thead>
            <tr className="bg-[#86BE9E] text-white">
              <th className="p-2">Code</th>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {/* APPROVAL 1 */}
            <tr className="bg-gray-50 text-center">
              <td className="font-semibold">Persetujuan 1</td>
              <td>{detailInfo.tanggal}</td>
              <td>Administrasi</td>
              <td>
                {renderStatus(approvalState.approval1)}
                {renderAction("torApproval1Status", approvalState.approval1)}
              </td>
            </tr>

            {/* APPROVAL 2 */}
            <tr className="bg-gray-100 text-center">
              <td className="font-semibold">Persetujuan 2</td>
              <td>{detailInfo.tanggal}</td>
              <td>Sekjur</td>
              <td>
                {renderStatus(approvalState.approval2)}
                {renderAction("torApproval2Status", approvalState.approval2)}
              </td>
            </tr>

            {/* APPROVAL 3 */}
            <tr className="bg-gray-50 text-center">
              <td className="font-semibold">Persetujuan 3</td>
              <td>{detailInfo.tanggal}</td>
              <td>Kajur</td>
              <td>
                {approvalState.approval1 === "Approved" &&
                approvalState.approval2 === "Approved" ? (
                  <>
                    {renderStatus(approvalState.approval3)}
                    {renderAction("torApproval3Status", approvalState.approval3)}
                  </>
                ) : (
                  <span className="text-gray-500">Pending</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= CATATAN ================= */}
      {canShowNote && (
        <>
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[2px] bg-gray-300" />
            <span className="text-gray-400 text-sm">PEMISAH SECTION</span>
            <div className="flex-1 h-[2px] bg-gray-300" />
          </div>

          {role !== "Pengaju" ? (
            <div>
              <textarea
                className="w-full border rounded-lg p-3 min-h-[12rem]"
                value={currentNote ?? ""}
                onChange={(e) => setCurrentNote(e.target.value)}
              />
              <button
                onClick={() => saveNote(userRole, currentNote)}
                className="mt-3 px-4 py-2 bg-[#4957B5] text-white rounded"
              >
                Simpan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["admin", "sekjur", "kajur"].map((r) => (
                <textarea
                  key={r}
                  readOnly
                  className="border rounded-lg p-3 min-h-80 text-gray-400"
                  value={notes[String(activity?.id)]?.[mode]?.[r] || ""}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApprovalAndNoteSection;
