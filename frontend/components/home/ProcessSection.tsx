import { Upload, Scan, Brain, CheckCircle } from "lucide-react";

export function ProcessSection() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Reference Image",
      description: "Provide a clear photo of the missing person. Our AI extracts unique facial features and generates a digital fingerprint.",
      color: "from-blue-500 to-cyan-500",
      details: ["Face detection", "Feature extraction", "Embedding generation"]
    },
    {
      icon: Scan,
      title: "CCTV Analysis",
      description: "We scan through vast amounts of surveillance footage, processing thousands of frames per second.",
      color: "from-cyan-500 to-teal-500",
      details: ["Person detection", "Face localization", "Frame extraction"]
    },
    {
      icon: Brain,
      title: "AI Matching",
      description: "Advanced neural networks compare facial features and metadata (age, gender, clothing) for accurate identification.",
      color: "from-teal-500 to-green-500",
      details: ["Similarity scoring", "Metadata fusion", "Confidence ranking"]
    },
    {
      icon: CheckCircle,
      title: "Results & Location",
      description: "Receive ranked matches with timestamps, locations, and confidence scores to aid your search.",
      color: "from-green-500 to-emerald-500",
      details: ["Video playback", "Timestamp data", "Location info"]
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our system combines YOLOv8, RetinaFace, and FAISS vector search to provide rapid, accurate results
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 via-teal-500 to-green-500 opacity-20"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:bg-gray-800/80 transition-all group">
                    {/* Step number */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`}></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}