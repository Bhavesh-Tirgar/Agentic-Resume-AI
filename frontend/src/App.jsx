import React, { useState } from "react";
import Navbar from "./components/Navbar";
import ResumeDropzone from "./components/ResumeDropzone";
import BentoDashboard from "./components/BentoDashboard";
import JobMatcher from "./components/JobMatcher";
import InterviewPrepDeck from "./components/InterviewPrepDeck";
import AuthModal from "./components/AuthModal";
import { DEMO_RESUME_RESULTS, removeAuthToken } from "./api";
import { Code2, ShieldCheck, Database, GitBranch } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("audit");
  const [user, setUser] = useState({ username: "Bhavesh" });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [results, setResults] = useState(DEMO_RESUME_RESULTS);

  const handleProcessingComplete = () => {
    setActiveTab("audit");
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-[#e5e7eb] flex flex-col selection:bg-[#273042] selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "audit" && (
          <BentoDashboard
            results={results}
            onNavigateToMatch={() => setActiveTab("matcher")}
            onNavigateToInterview={() => setActiveTab("interview")}
          />
        )}

        {activeTab === "matcher" && (
          <JobMatcher onStartInterview={() => setActiveTab("interview")} />
        )}

        {activeTab === "interview" && (
          <InterviewPrepDeck />
        )}

        {activeTab === "upload" && (
          <ResumeDropzone onProcessingComplete={handleProcessingComplete} />
        )}
      </main>

      {/* Utilitarian Footer */}
      <footer className="border-t border-[#181c25] bg-[#0c0e13] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b7585]">
          <div className="flex items-center gap-2">
            <span className="text-[#c4ccd9] font-medium">ResumeStudio Engineering</span>
            <span>•</span>
            <span>LangGraph Multi-Agent Engine with Django REST Backend</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-[#8c96a8]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>JWT & Rate-Limited</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#8c96a8]">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>ACID Atomic Transactions</span>
            </span>
            <a
              href="https://github.com/Bhavesh-Tirgar/Agentic-Resume-AI"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#8c96a8] hover:text-white transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Source Repository</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}
