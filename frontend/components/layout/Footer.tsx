import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Dishant, Mukul & Kalp to reunite families
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2025 AI Missing Person Finder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}