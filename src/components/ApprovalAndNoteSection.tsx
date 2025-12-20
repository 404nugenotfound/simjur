import type { RoleId, ApprovalField } from "@/utils/role";

type UserRoleName =
  | "admin"
  | "administrasi"
  | "pengaju"
  | "sekretaris"
  | "ketua_jurusan";

type ApprovalStateUI = {
  approval1: "Pending" | "Approved" | "Rejected" | "Revisi";
  approval2: "Pending" | "Approved" | "Rejected" | "Revisi";
  approval3: "Pending" | "Approved" | "Rejected" | "Revisi";
};

/* ===================== ROLE → APPROVAL LEVEL ===================== */
const ROLE_APPROVAL_LEVEL: Record<RoleId, 1 | 2 | 3 | null> = {
  1: 1, // admin
  2: 1, // administrasi
  3: null, // pengaju
  4: 2, // sekretaris
  5: 3, // ketua jurusan
};

/* ===================== NOTE KEY MAP ===================== */
const NOTE_KEY_MAP: Record<number, string> = {
  1: "admin",
  4: "sekjur",
  5: "kajur",
};

/* ===================== PROPS ===================== */
type Props = {
  activeTab: string;
  detailInfo: any;

  approvalState: ApprovalStateUI;
  hasDownloaded: boolean;

  handleApprove: (field: ApprovalField) => void;
  handleReject: (field: ApprovalField) => void;
  handleRevisi: (field: ApprovalField) => void;

  canShowNote: boolean;

  roleId: RoleId;
  userRoleName: UserRoleName;

  notes: any;
  activity: any;
  mode: "TOR" | "LPJ";

  currentNote: string;
  setCurrentNote: (val: string) => void;
  saveNote: (role: UserRoleName, note: string) => void;
};

/* ===================== COMPONENT ===================== */
const ApprovalAndNoteSection = ({
  activeTab,
  detailInfo,
  approvalState,
  hasDownloaded,
  handleApprove,
  handleReject,
  handleRevisi,
  canShowNote,
  roleId,
  userRoleName,
  notes,
  activity,
  mode,
  currentNote,
  setCurrentNote,
  saveNote,
}: Props) => {
  if (activeTab !== "approval") return null;

  /* ===================== HELPERS ===================== */
  const getApprovalField = (
    mode: "TOR" | "LPJ",
    level: 1 | 2 | 3,
  ): ApprovalField =>
    `${mode.toLowerCase()}Approval${level}Status` as ApprovalField;

  const getApprovalStatus = (level: 1 | 2 | 3) =>
    approvalState[`approval${level}`];

  const renderStatus = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="text-green-600 font-semibold">Disetujui ✔</span>
        );
      case "Rejected":
        return <span className="text-red-700 font-semibold">Ditolak ✖</span>;
      case "Revisi":
        return <span className="text-orange-600 font-semibold">Revisi ✎</span>;
      default:
        return <span className="text-gray-500 font-medium">Pending</span>;
    }
  };

  /* ===================== CORE LOGIC (KUNCI) ===================== */
  const canTakeAction = (level: 1 | 2 | 3, status: string) => {
    const myLevel = ROLE_APPROVAL_LEVEL[roleId];
    if (!myLevel) return false;

    return myLevel === level && status === "Pending";
  };

  const renderAction = (field: ApprovalField) => (
    <div className="flex gap-2 justify-center py-2">
      <button
        disabled={!hasDownloaded}
        onClick={() => handleApprove(field)}
        className="px-3 py-1 text-xs bg-[#4957B5] text-white rounded
        hover:scale-95 disabled:bg-gray-400"
      >
        Setujui
      </button>
      <button
        disabled={!hasDownloaded}
        onClick={() => handleReject(field)}
        className="px-3 py-1 text-xs bg-[#9C1818] text-white rounded
        hover:scale-95 disabled:bg-gray-400"
      >
        Tolak
      </button>
    </div>
  );

  const handleSaveNoteWithRevisi = () => {
    saveNote(userRoleName, currentNote);

    const myLevel = ROLE_APPROVAL_LEVEL[roleId];
    if (!myLevel) return;

    handleRevisi(getApprovalField(mode, myLevel));
  };

  const NOTE_PLACEHOLDER_MAP: Record<string, string> = {
    admin: "Belum ada catatan revisi dari Administrasi",
    sekjur: "Belum ada catatan revisi dari Sekretaris",
    kajur: "Belum ada catatan revisi dari Ketua Jurusan",
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
      <h2 className="font-semibold mb-4 text-lg">Status Persetujuan</h2>

      {/* ================= TABLE ================= */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#86BE9E] text-white">
              <th className="p-2">Tahap</th>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((lvl) => {
              const level = lvl as 1 | 2 | 3;
              const field = getApprovalField(mode, level);
              const status = getApprovalStatus(level);

              const locked =
                level === 3 &&
                (approvalState.approval1 !== "Approved" ||
                  approvalState.approval2 !== "Approved");

              return (
                <tr key={level} className="odd:bg-gray-50 even:bg-gray-100">
                  <td className="text-center font-semibold py-3">
                    Persetujuan {level}
                  </td>
                  <td className="text-center">{detailInfo?.tanggal}</td>
                  <td className="text-center">
                    {level === 1 && "Administrasi"}
                    {level === 2 && "Sekretaris"}
                    {level === 3 && "Ketua Jurusan"}
                  </td>
                  <td className="text-center">
                    {locked
                      ? renderStatus("Pending")
                      : canTakeAction(level, status)
                        ? renderAction(field)
                        : renderStatus(status)}
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
          <div className="flex items-center gap-4 my-12">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-400 text-sm">SEPARATOR PAR CATATAN</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {roleId !== 3 ? (
            <div className="relative">
              <textarea
                className="w-full border rounded-lg p-3 min-h-[10rem]"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="Tulis catatan revisi..."
              />
              <button
                disabled={!hasDownloaded}
                onClick={handleSaveNoteWithRevisi}
                className="absolute bottom-4 right-4 px-4 py-1
                bg-[#4957B5] text-white rounded disabled:bg-gray-400
                hover:scale-[0.97]"
              >
                Simpan
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(NOTE_KEY_MAP).map(([id, key]) => (
                <div key={id}>
                  <p className="text-sm font-semibold mb-1">
                    Catatan {key.toUpperCase()}
                  </p>
                  <textarea
                    readOnly
                    className="w-full border rounded-lg p-3 min-h-[14rem]"
                    placeholder={
                      !notes?.[String(activity?.id)]?.[mode]?.[key]
                        ? NOTE_PLACEHOLDER_MAP[key]
                        : ""
                    }
                    value={notes?.[String(activity?.id)]?.[mode]?.[key] || ""}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApprovalAndNoteSection;
