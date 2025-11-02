import React from "react";
import { Clock, User, Video, Database, CheckCircle } from "lucide-react";

interface WorkflowProgressProps {
  currentStep: number;
}

export function WorkflowProgress({ currentStep }: WorkflowProgressProps) {
  const steps = [
    { num: 1, label: "Upload Reference", icon: User },
    { num: 2, label: "Process CCTV", icon: Video },
    { num: 3, label: "Search Database", icon: Database },
    { num: 4, label: "View Matches", icon: CheckCircle },
  ];

  return (
    <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-400" />
        Workflow Progress
      </h3>
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.num
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/40"
                }`}
              >
                <step.icon className="w-6 h-6" />
              </div>
              <span
                className={`text-xs mt-2 ${
                  currentStep >= step.num ? "text-white" : "text-white/40"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < 3 && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-all ${
                  currentStep > step.num ? "bg-blue-500" : "bg-white/10"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}