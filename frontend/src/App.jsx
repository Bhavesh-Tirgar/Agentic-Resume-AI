import React, { useState } from "react";
import Navbar from "./components/Navbar";
import ResumeDropzone from "./components/ResumeDropzone";
import BentoDashboard from "./components/BentoDashboard";
import JobMatcher from "./components/JobMatcher";
import InterviewPrepDeck from "./components/InterviewPrepDeck";
import AuthModal from "./components/AuthModal";
import { DEMO_RESUME_RESULTS, removeAuthToken } from "./api";
import { Sparkles, Shield, Cpu, Code2, ExternalLink } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState({ username: "Bhavesh" });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [results, setResults] = useState(DEMO_RESUME_RESULTS);

  const handleProcessingComplete = () => {
    setActiveTab("analyzer");
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col bg-grid-pattern selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <div className="space-y-12">
            <ResumeDropzone onProcessingComplete={handleProcessingComplete} />
            
            {/* Bento Grid Preview on Overview */}
            <div className="pt-6 border-t border-white/5">
              <div className="text-center mb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interactive Live Preview</span>
                <h3 className="text-xl font-bold text-white mt-1">Explore Audited Candidate Results</h3>
              </div>
              <BentoDashboard
                results={results}
                onNavigateToMatch={() => setActiveTab("matcher")}
                onNavigateToInterview={() => setActiveTab("interview")}
              />
            </div>
          </div>
        )}

        {activeTab === "analyzer" && (
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
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#090b12] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-semibold">Agentic Resume AI</span>
            <span>•</span>
            <span>Engineered with LangGraph, Django REST Framework & React</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Hardened Architecture</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-400" /> Multi-Agent Swarm</span>
            <a
              href="https://github.com/Bhavesh-Tirgar/Agentic-Resume-AI"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
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
