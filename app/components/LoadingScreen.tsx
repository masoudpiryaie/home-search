import { Home } from "lucide-react";

type LoadingScreenProps = {
  text?: string;
  fullScreen?: boolean;
};

export default function LoadingScreen({
  text = "Loading...",
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-[999]" : "absolute inset-0 z-20"
      } flex items-center justify-center bg-white/55 px-4 backdrop-blur-md`}
    >
      <div className="flex flex-col items-center rounded-[2rem] border border-white/60 bg-white/80 px-8 py-7 shadow-2xl shadow-black/10 backdrop-blur-xl">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-[1.7rem] bg-black/10" />

          <div className="animate-home-float rounded-[1.7rem] bg-black p-5 text-white shadow-lg">
            {" "}
            <Home size={34} strokeWidth={2.4} />
          </div>
        </div>

        <p className="mt-5 text-sm font-black tracking-tight text-gray-950">
          {text}
        </p>

        <p className="mt-1 text-xs text-gray-500">Please wait a moment</p>
      </div>
    </div>
  );
}
