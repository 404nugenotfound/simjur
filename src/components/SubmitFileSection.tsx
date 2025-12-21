import { TrashIcon } from "@heroicons/react/24/solid";
import { deleteFile, getFile } from "../utils/indexedDB";
import { Toaster, toast } from "sonner";
type Props = {
  role: string;
  mode: "TOR" | "LPJ";
  id?: string | number;
  currentFile: File | null;
  hasSubmitted: boolean;
  isDragging: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, File | null>>>;
  setHasDownloaded: (value: boolean) => void;
  onSuccess: () => void;
};

const SubmitFileSection = ({
  role,
  mode,
  id,
  currentFile,
  hasSubmitted,
  isDragging,
  handleFileChange,
  setFiles,
  setHasDownloaded,
}: Props) => {
  /** 🔒 GUARD */
  const isValidId = typeof id === "string" || typeof id === "number";

  const handleDownload = async () => {
    if (!isValidId) {
      toast.error("ID tidak valid");
      return;
    }

    const key = `file-${mode}-${id}`;
    let fileToDownload = currentFile;

    try {
      // Kalau placeholder, ambil dari IndexedDB
      if (!(currentFile instanceof File)) {
        fileToDownload = await getFile(key);
      }

      if (fileToDownload instanceof File) {
        const url = URL.createObjectURL(fileToDownload);
        const a = document.createElement("a");

        a.href = url;
        a.download = fileToDownload.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        setHasDownloaded(true);

        // TOAST BERHASIL
        toast.success("File berhasil diunduh");
      } else {
        // FILE HILANG
        toast.warning(
          "File asli sudah hilang. Silakan upload ulang untuk download.",
        );
      }
    } catch (error) {
      console.error(error);

      // ❌ ERROR SYSTEM
      toast.error("Terjadi kesalahan saat mengunduh file");
    }
  };

  const handleDelete = async () => {
    if (!isValidId) {
      toast.error("ID tidak valid");
      return;
    }

    toast("Yakin mau hapus file ini?", {
      description: "File yang sudah dihapus tidak bisa dikembalikan.",
      action: {
        label: "Hapus",
        onClick: async () => {
          try {
            const key = `file-${mode}-${id}`;

            setFiles((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });

            await deleteFile(key);
            localStorage.removeItem(key);
            localStorage.removeItem(`file-name-${mode}-${id}`);

            toast.success("File berhasil dihapus");
          } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus file");
          }
        },
      },
      duration: 8000, // biar user sempat mikir
    });
  };

  return (
    <div className="bg-gray-50 rounded-xl shadow-inner">
      <div
        className={`rounded-3xl min-h-[180px] flex flex-col items-center justify-center px-6 transition ${
          currentFile
            ? "border-none bg-transparent p-0"
            : isDragging
              ? "border-2 border-indigo-500 border-dashed bg-indigo-50"
              : "border-2 border-green-300 border-dashed bg-green-100/70"
        }`}
      >
        {/* ================= BELUM ADA FILE ================= */}
        {!currentFile ? (
          role === "pengaju" ? (
            <div className="flex flex-col items-center gap-4 p-10">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow">
                <span className="text-2xl">⬆️</span>
              </div>

              <p className="font-medium text-gray-800">
                Unggah File {mode} di sini atau Telusuri Dokumen
              </p>

              <p className="text-xs text-gray-600">Format: PDF (max 10MB)</p>

              <button
                type="button"
                disabled={!isValidId}
                className="mt-2 px-4 py-2 rounded-full bg-white text-sm shadow border hover:scale-95 disabled:opacity-50"
                onClick={() =>
                  document.getElementById(`file-input-${mode}-${id}`)?.click()
                }
              >
                Telusuri Dokumen
              </button>

              <input
                id={`file-input-${mode}-${id}`}
                type="file"
                accept=".pdf, .docx"
                className="hidden"
                disabled={!isValidId}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="text-center p-10 text-gray-600">
              Hanya <b>Pengaju</b> yang dapat mengunggah file.
              <br />
              Ose cuma bisa melihat atau mengunduh file kalau sudah ada.
            </div>
          )
        ) : (
          /* ================= FILE SU ADA ================= */
          <div className="w-full flex justify-center mt-2">
            <div className="flex items-center justify-between bg-[#A4CEB6] px-8 py-8 rounded-xl shadow-md w-full max-w-[900px]">
              <p className="text-gray-100 font-semibold text-xl truncate max-w-[65%]">
                {currentFile.name}
              </p>

              <div className="flex items-center gap-3">
                {/* UNDUH */}
                <button
                  disabled={!isValidId}
                  className="px-6 py-2.5 text-sm rounded-lg bg-[#4957B5] text-white font-semibold hover:scale-[0.97] disabled:opacity-50"
                  onClick={handleDownload}
                >
                  Unduh
                </button>

                {/* HAPUS */}
                {role === "pengaju" && (
                  <button
                    aria-label="hapus"
                    disabled={!isValidId}
                    className="px-5 py-2 rounded-lg bg-[#9C1818] text-white hover:scale-[0.97] disabled:opacity-50"
                    onClick={handleDelete}
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitFileSection;
