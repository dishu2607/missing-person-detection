"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Upload, Users, LayoutDashboard, Home } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Find Missing Person", icon: Search },
    { href: "/upload-footage", label: "Upload CCTV", icon: Upload },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/team", label: "Our Team", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                AI Missing Person Finder
              </h1>
              <p className="text-xs text-gray-400">Reuniting Families with Technology</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}