import { InformationCircleIcon } from "@heroicons/react/24/solid";

export default function InfoButton({ text }: { text: string }) {
  return (
    <div className="relative group flex items-center">
      <InformationCircleIcon className="w-5 h-5 text-gray-500 cursor-pointer hover:text-[#4957B5]" />

      {/* Tooltip */}
      <div
        className="
          absolute right-0 top-7 z-50
          hidden group-hover:block
          bg-gray-700 text-white text-xs
          rounded-md px-6 py-2 w-64
          shadow-lg text-justify leading-relaxed
          max-w-xs break-words
        "
      >
        {text}
      </div>
    </div>
  );
}
