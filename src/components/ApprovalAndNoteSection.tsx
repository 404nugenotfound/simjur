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
    switch (status) {
      case "Approved":
        return (
          <span className="text-green-600 font-semibold">Disetujui ✔</span>
        );

      case "Rejected":
        return <span className="text-red-800 font-semibold">Ditolak ✖</span>;

      case "Revisi":
        return <span className="text-orange-600 font-semibold">Revisi ✎</span>;

      default:
        return <span className="text-gray-500 font-medium">Pending</span>;
    }
  };

  const renderAction = (field: ApprovalField, status: string) => {
    const canTakeAction =
      ["Pending", "Revisi"].includes(status) && allowedField === field;

    if (!canTakeAction) return null;

    return (
      <div className="flex gap-2 justify-center py-2 font-medium">
        <button
          disabled={!hasDownloaded}
          onClick={() => handleApprove(field)}
          className="px-3 py-[0.4rem] text-xs bg-[#4957B5] hover:scale-95 text-white rounded
        disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Setujui
        </button>

        <button
          disabled={!hasDownloaded}
          onClick={() => handleReject(field)}
          className="px-3 py-[0.4rem] text-xs bg-[#9C1818] hover:scale-95 text-white rounded
        disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Tolak
        </button>
      </div>
    );
  };

  const canTakeAction = (field: ApprovalField, status: string) =>
    ["Pending", "Revisi"].includes(status) && allowedField === field;

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
      <h2 className="font-semibold mb-4 text-lg">Status Persetujuan</h2>

      {/* ================= TABLE APPROVAL ================= */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm text-gray-500">
          <thead>
            <tr className="bg-[#86BE9E] text-white">
              <th className="p-2">Code</th>
              <th className="max-w-xs">Tanggal Pengajuan</th>
              <th>Deskripsi</th>
              <th className="px-12">Status</th>
            </tr>
          </thead>

          <tbody>
            {/* APPROVAL 1 */}
            <tr className="bg-gray-50 text-center">
              <td className="p-2 font-semibold">Persetujuan 1</td>
              <td>{detailInfo.tanggal}</td>
              <td>Persetujuan dari Administrasi</td>
              <td>
                <div className="flex items-center justify-center gap-2">
                  {canTakeAction("torApproval1Status", approvalState.approval1)
                    ? renderAction(
                        "torApproval1Status",
                        approvalState.approval1
                      )
                    : renderStatus(approvalState.approval1)}
                </div>
              </td>
            </tr>

            {/* APPROVAL 2 */}
            <tr className="bg-gray-100 text-center">
              <td className="p-2 font-semibold">Persetujuan 2</td>
              <td>{detailInfo.tanggal}</td>
              <td>Persetujuan dari Sekjur</td>
              <td>
                <div className="flex items-center justify-center gap-2">
                  {canTakeAction("torApproval2Status", approvalState.approval2)
                    ? renderAction(
                        "torApproval2Status",
                        approvalState.approval2
                      )
                    : renderStatus(approvalState.approval2)}
                </div>
              </td>
            </tr>

            {/* APPROVAL 3 */}
            <tr className="bg-gray-50 text-center">
              <td className="p-2 font-semibold">Persetujuan 3</td>
              <td>{detailInfo.tanggal}</td>
              <td>Persetujuan dari Kajur</td>
              <td>
                <div className="flex items-center justify-center gap-2">
                  {approvalState.approval1 === "Approved" &&
                  approvalState.approval2 === "Approved" ? (
                    canTakeAction(
                      "torApproval3Status",
                      approvalState.approval3
                    ) ? (
                      renderAction(
                        "torApproval3Status",
                        approvalState.approval3
                      )
                    ) : (
                      renderStatus(approvalState.approval3)
                    )
                  ) : (
                    <span className="text-gray-500 font-medium">Pending</span>
                  )}
                </div>
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
            <span className="text-gray-400 text-sm">PEMISAH ANTAR SECTION</span>
            <div className="flex-1 h-[2px] bg-gray-300" />
          </div>

          <h2 className="font-semibold mb-3 text-lg">Catatan Revisi</h2>
          <p className="text-sm font-medium mb-2">Catatan dari {role}</p>

          {role !== "Pengaju" ? (
            <div className="relative w-full">
              <textarea
                className="w-full border rounded-lg p-3 min-h-[12rem] resize-none"
                value={currentNote ?? ""}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Tulis catatan revisi di sini..."
              />
              <button
                onClick={() => saveNote(userRole, currentNote)}
                className="absolute bottom-5 right-4 px-4 py-1 bg-[#4957B5] hover:scale-[0.97] text-white font-medium tracking-[0.05em] rounded"
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
