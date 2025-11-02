import { AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export function SystemInfo() {
  return (
    <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
     <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-blue-400" />
        System Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-white/60 mb-1">Detection Models</p>
          <p className="text-white">YOLOv8 + RetinaFace</p>
        </div>
        <div>
          <p className="text-white/60 mb-1">Embedding System</p>
          <p className="text-white">FAISS Vector Search</p>
        </div>
        <div>
          <p className="text-white/60 mb-1">API Endpoint</p>
          <p className="text-blue-400 break-all">{api.baseUrl}</p>
        </div>
      </div>
    </div>
  );
}