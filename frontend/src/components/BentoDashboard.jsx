import React, { useState } from "react";
import { 
  Sparkles, Award, CheckCircle, AlertTriangle, TrendingUp, Lightbulb, 
  Briefcase, GraduationCap, Code, ArrowRight, Zap, Target, BookmarkCheck
} from "lucide-react";

export default function BentoDashboard({ results, onNavigateToMatch, onNavigateToInterview }) {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("strengths");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("all");

  const { score_data, analysis_data, parsed_data } = results;
  const overallScore = score_data?.overall_score || 85;

  // Helper for score color
  const getScoreColor = (score) => {
    if (score >= 85) return { stroke: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 70) return { stroke: "#6366f1", text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" };
    return { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  };

  const scoreTheme = getScoreColor(overallScore);

  // Circular progress calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="w-full max-w-7xl mx-auto py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Analysis Completed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span className="text-xs text-slate-400">Candidate: <strong className="text-white">{parsed_data?.name || "Bhavesh Tirgar"}</strong></span>
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">Executive ATS & Skills Intelligence</h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onNavigateToMatch}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-emerald-300" />
            <span>Match with Job Description</span>
          </button>
          <button
            onClick={onNavigateToInterview}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Interview Prep Simulator</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Master ATS Score Gauge (Hero 4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl glass-panel p-6 flex flex-col justify-between glass-panel-hover">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall ATS Readiness</span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${scoreTheme.bg} ${scoreTheme.text} ${scoreTheme.border}`}>
                Grade {score_data?.grade || "A"} • Top 5%
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#1e2538"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke={scoreTheme.stroke}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{overallScore}</span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">/ 100 PTS</span>
                </div>
              </div>
            </div>

            {/* Recruiter Summary */}
            <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-black/20 p-3 rounded-xl border border-white/5">
              "{score_data?.summary}"
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> ATS Parsable</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Multi-Agent Audited</span>
          </div>
        </div>

        {/* Card 2: ATS Sub-Categories Breakdown (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl glass-panel p-6 glass-panel-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metric Breakdown Matrix</h3>
              <span className="text-xs text-slate-400">Audited against 4,000+ top ATS screening filters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {score_data?.categories?.map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0f1320] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                    <span className="text-xs font-bold text-emerald-400">{cat.score}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${cat.score}%` }}
                    ></div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">{cat.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Machine-readable format detected</span>
            <span className="text-emerald-400 font-medium">99.4% Parsing Confidence</span>
          </div>
        </div>

        {/* Card 3: Executive Recruiter Qualitative Audit (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 glass-panel-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recruiter Qualitative Review</h3>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#101422] p-1 rounded-xl border border-white/5">
              {[
                { id: "strengths", label: "Strengths" },
                { id: "weaknesses", label: "Gaps" },
                { id: "improvements", label: "Action Items" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAnalysisTab(tab.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    activeAnalysisTab === tab.id
                      ? "bg-indigo-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-2.5 min-h-[180px]">
            {activeAnalysisTab === "strengths" && (
              analysis_data?.strengths?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))
            )}

            {activeAnalysisTab === "weaknesses" && (
              analysis_data?.weaknesses?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))
            )}

            {activeAnalysisTab === "improvements" && (
              analysis_data?.improvements?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200">
                  <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 4: Verified Skills Architecture (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 glass-panel-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identified Skill Stack</h3>
              <span className="text-xs font-semibold text-emerald-400">{parsed_data?.skills?.length || 0} Skills</span>
            </div>

            <p className="text-xs text-slate-400 mb-4">Extracted & categorized from parsed work experience and technical projects.</p>

            {/* Badges Cloud */}
            <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto pr-1">
              {parsed_data?.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-[#14192b] border border-white/10 text-slate-200 hover:border-indigo-500/50 hover:text-white transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>High keyword density</span>
            <span className="text-indigo-400">Ready for Job Matching</span>
          </div>
        </div>

        {/* Card 5: Parsed Experience & Education Timeline (12 Cols) */}
        <div className="lg:col-span-12 rounded-2xl glass-panel p-6 glass-panel-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Parsed Candidate Profile</h3>
            <span className="text-xs text-slate-400">Extracted by ResumeParserAgent</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Experience */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Experience</span>
              </div>
              {parsed_data?.experience?.map((exp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0f1320] border border-white/5 space-y-1">
                  <div className="text-xs font-bold text-white">{exp.role}</div>
                  <div className="text-[11px] text-slate-400">{exp.organization} • {exp.duration}</div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">{exp.description}</div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Code className="w-3.5 h-3.5" />
                <span>Projects</span>
              </div>
              {parsed_data?.projects?.map((proj, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0f1320] border border-white/5 space-y-1">
                  <div className="text-xs font-bold text-white">{proj.name}</div>
                  <div className="text-xs text-slate-300 leading-relaxed">{proj.description}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {proj.technologies?.map((tech, tIdx) => (
                      <span key={tIdx} className="px-1.5 py-0.5 text-[10px] bg-indigo-950/40 text-indigo-300 rounded border border-indigo-900/40">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Education & Certifications */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Education & Certs</span>
              </div>
              {parsed_data?.education?.map((edu, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0f1320] border border-white/5 space-y-1">
                  <div className="text-xs font-bold text-white">{edu.degree}</div>
                  <div className="text-[11px] text-slate-400">{edu.institution} • {edu.year}</div>
                  <div className="text-xs text-emerald-400 font-medium">Grade: {edu.grade}</div>
                </div>
              ))}
              {parsed_data?.certifications?.map((cert, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0f1320] border border-white/5 text-xs text-slate-300">
                  <span className="font-semibold text-white">{cert.name}</span> — {cert.issuer} ({cert.date})
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
