import { AlertCircle } from "lucide-react";

interface StatusMessageProps {
  message: string;
}

export function StatusMessage({ message }: StatusMessageProps) {
  if (!message) return null;

  return (
    <div className="mb-6 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-blue-300" />
        <p className="text-blue-100 text-sm">{message}</p>
      </div>
    </div>
  );
}