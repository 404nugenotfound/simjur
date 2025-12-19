import { ApprovalField } from "@/utils/role";

type Role = "admin" | "administrasi" | "pengaju" | "sekretaris" | "ketua_jurusan";
type UserRole = "admin" | "administrasi" | "pengaju" | "sekretaris" | "ketua_jurusan";

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
  handleRevisi: (field: ApprovalField) => void;

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
  handleRevisi,
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

  const getApprovalField = (
    mode: "TOR" | "LPJ",
    level: 1 | 2 | 3
  ): ApprovalField => {
    return `${mode.toLowerCase()}Approval${level}Status` as ApprovalField;
  };

  const getApprovalStatus = (state: ApprovalStateUI, level: 1 | 2 | 3) => {
    return state[`approval${level}` as keyof ApprovalStateUI];
  };

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
      ["Pending"].includes(status) && allowedField === field;

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

const handleSaveNoteWithRevisi = () => {
    saveNote(userRole, currentNote);

    const roleLevelMap: Record<UserRole, 1 | 2 | 3> = {
      admin: 1,
      administrasi: 2,
      pengaju: 1,
      sekretaris: 2,
      ketua_jurusan: 3,
    };

    // Only allow revisi for non-pengaju roles
    if (userRole !== "pengaju") {
      const level = roleLevelMap[userRole];
      const field = getApprovalField(mode, level);
      handleRevisi(field);
    }
  };

  const canTakeAction = (field: ApprovalField, status: string) =>
    ["Pending"].includes(status) && allowedField === field;

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
            {[1, 2, 3].map((level) => {
              const field = getApprovalField(mode, level as 1 | 2 | 3);
              const status = getApprovalStatus(
                approvalState,
                level as 1 | 2 | 3
              );

              const isLocked =
                level === 3 &&
                (approvalState.approval1 !== "Approved" ||
                  approvalState.approval2 !== "Approved");

              return (
                <tr
                  key={level}
                  className={level % 2 ? "bg-gray-50" : "bg-gray-100"}
                >
                  <td className="p-2 font-semibold text-center">
                    Persetujuan {level}
                  </td>
                  <td className="text-center">{detailInfo.tanggal}</td>
                  <td className="text-center">
                    {level === 1 && "Persetujuan dari Administrasi"}
                    {level === 2 && "Persetujuan dari Sekjur"}
                    {level === 3 && "Persetujuan dari Kajur"}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      {isLocked ? (
                        <span className="text-gray-500 font-medium">
                          Pending
                        </span>
                      ) : canTakeAction(field, status) ? (
                        renderAction(field, status)
                      ) : (
                        renderStatus(status)
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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

          {role !== "pengaju" ? (
            <div className="relative w-full">
              <textarea
                className="w-full border rounded-lg p-3 min-h-[12rem] resize-none"
                value={currentNote ?? ""}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Tulis catatan revisi di sini..."
              />
              <button
                disabled={!hasDownloaded}
                onClick={handleSaveNoteWithRevisi}
                className="absolute bottom-5 right-4 px-4 py-1 bg-[#4957B5] hover:scale-[0.97] 
                text-white font-medium tracking-[0.05em] rounded
                disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          ) : (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "admin", label: "Catatan dari Admin" },
              { key: "sekjur", label: "Catatan dari Sekjur" },
              { key: "kajur", label: "Catatan dari Kajur" },
            ].map((r) => {
              const note = notes[String(activity?.id)]?.[mode]?.[r.key];

              return (
                <div key={r.key} className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-gray-600">
                    {r.label}
                  </span>

                  <textarea
                    readOnly
                    placeholder={`Belum ada catatan dari ${r.label.replace("Catatan dari ", "")}`}
                    className="border rounded-lg p-3 min-h-80 text-gray-400 placeholder:text-gray-300"
                    value={note || undefined}
                  />
                </div>
              );
            })}
          </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApprovalAndNoteSection;
