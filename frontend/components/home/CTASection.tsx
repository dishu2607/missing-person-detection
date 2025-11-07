import Link from "next/link";
import { ArrowRight, Shield, Clock, Heart } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 sm:p-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                Ready to Start Your Search?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                Don't wait. Every moment matters in finding your loved one. Our AI is ready to help 24/7.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Clock, text: "Instant Processing" },
                { icon: Shield, text: "100% Confidential" },
                { icon: Heart, text: "No Cost to Families" },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl py-4 px-6">
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link
                href="/search"
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 group"
              >
                Begin Search Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-4 text-blue-100 text-sm">
                Free for families • Available worldwide • No registration required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}