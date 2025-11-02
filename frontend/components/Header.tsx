import { Search } from "lucide-react";

export function Header() {
  return (
    <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              AI-Powered Missing Person Identification System
            </h1>
            <p className="text-blue-200 text-sm">
              Multi-modal CCTV Analysis with Face Recognition & Metadata Fusion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}