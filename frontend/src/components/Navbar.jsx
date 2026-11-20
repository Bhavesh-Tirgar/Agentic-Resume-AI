import React from "react";
import { FileText, Target, HelpCircle, Upload, LogIn, LogOut, CheckCircle2, ChevronRight } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, user, onAuthClick, onLogout }) {
  const navTabs = [
    { id: "audit", label: "Audit Dossier", icon: FileText },
    { id: "matcher", label: "Job Matcher", icon: Target },
    { id: "interview", label: "Interview Studio", icon: HelpCircle },
    { id: "upload", label: "Upload & Ingest", icon: Upload },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d0f14] border-b border-[#1c212c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("audit")}>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-sm tracking-tight shadow-sm">
            RA
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white tracking-tight">ResumeStudio</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#181d26] text-[#8c96a8] border border-[#232936]">v2.4</span>
          </div>
        </div>

        {/* Center Nav Segmented Control */}
        <nav className="hidden md:flex items-center gap-1 bg-[#13161d] p-1 rounded-lg border border-[#1f2430]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-[#222836] text-white shadow-sm font-semibold"
                    : "text-[#8c96a8] hover:text-white hover:bg-[#1a1f29]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-[#6b7585]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status & Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#13161e] border border-[#1d222e] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[#8c96a8] truncate max-w-[140px]">Bhavesh_Tirgar.pdf</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white px-2 py-1 rounded bg-[#181d26] border border-[#232936]">
                {user.username || "Bhavesh"}
              </span>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded hover:bg-[#1f2432] text-[#8c96a8] hover:text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white text-black hover:bg-neutral-200 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
