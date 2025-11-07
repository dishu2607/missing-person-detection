"use client";

import { useEffect, useState } from "react";
import { Users, Video, CheckCircle, TrendingUp } from "lucide-react";

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    {
      icon: Users,
      value: "460,000+",
      label: "Missing persons reported annually in the US",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Video,
      value: "70M+",
      label: "CCTV cameras worldwide",
      color: "from-cyan-500 to-teal-500",
    },
    {
      icon: CheckCircle,
      value: "92%",
      label: "Success rate with quality footage",
      color: "from-teal-500 to-green-500",
    },
    {
      icon: TrendingUp,
      value: "24/7",
      label: "Continuous automated monitoring",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Every Second Counts
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Time is critical in missing person cases. Our AI works around the clock to provide the fastest possible results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`relative group ${
                  isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:bg-gray-800/80 transition-all hover:scale-105 hover:border-gray-600">
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Value */}
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>

                  {/* Label */}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {stat.label}
                  </p>

                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}