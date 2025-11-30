import { useNavigate } from "react-router-dom";

export default function UserDropdown({ close }: { close: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="absolute top-16 right-6 bg-white shadow-lg rounded-md w-40 py-2">
      <button
            className="w-full text-left text-black px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              console.log("Go to Profile");
            }}
          >
            Profile
          </button>

          <button
            className="w-full text-left text-black px-4 py-2 hover:bg-gray-100 text-red-500"
            onClick={() => {
              navigate("/");
            }}
          >
            Logout
          </button>
    </div>
  );
}
