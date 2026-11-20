import React, { useState } from "react";
import { Target, CheckCircle2, XCircle, ArrowRight, Layers, FileText, Check } from "lucide-react";
import { DEMO_JOB_MATCH, DEMO_JOB_PRESETS } from "../api";

export default function JobMatcher({ onStartInterview }) {
  const [selectedPreset, setSelectedPreset] = useState("backend-ai");
  const [jobTitle, setJobTitle] = useState(DEMO_JOB_PRESETS[0].title);
  const [jobDescription, setJobDescription] = useState(DEMO_JOB_PRESETS[0].description);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(DEMO_JOB_MATCH);

  const handleSelectPreset = (presetId) => {
    setSelectedPreset(presetId);
    const preset = DEMO_JOB_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setJobTitle(preset.title);
      setJobDescription(preset.description);
    }
  };

  const handleRunMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setMatchResult(DEMO_JOB_MATCH);
    }, 600);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Job Description Alignment & Gap Engine</h1>
        <p className="text-xs text-[#8c96a8] mt-1">
          Evaluate your resume against specific job requirements. Identify missing ATS keywords, compute skill alignment percentages, and view tailored adjustment recommendations.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono text-[#6b7585] uppercase tracking-wider shrink-0 mr-1">Sample Roles:</span>
        {DEMO_JOB_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
              selectedPreset === preset.id
                ? "bg-[#1f2533] border-[#384256] text-white"
                : "bg-[#12151c] border-[#1d222e] text-[#8c96a8] hover:text-white"
            }`}
          >
            {preset.title}
          </button>
        ))}
        <button
          onClick={() => {
            setSelectedPreset("custom");
            setJobTitle("");
            setJobDescription("");
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
            selectedPreset === "custom"
              ? "bg-[#1f2533] border-[#384256] text-white"
              : "bg-[#12151c] border-[#1d222e] text-[#8c96a8] hover:text-white"
          }`}
        >
          Custom Paste
        </button>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Job Description Input (5 Cols) */}
        <div className="lg:col-span-5 surface-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              Target Position Requirements
            </h2>
          </div>

          <div>
            <label className="text-xs text-[#8c96a8] block mb-1">Target Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full px-3 py-2 text-xs rounded-md bg-[#0d0f14] border border-[#202532] text-white focus:outline-none focus:border-[#3d465c] transition font-medium"
            />
          </div>

          <div>
            <label className="text-xs text-[#8c96a8] block mb-1">Job Description Text</label>
            <textarea
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting requirements and expectations here..."
              className="w-full px-3 py-2.5 text-xs rounded-md bg-[#0d0f14] border border-[#202532] text-white focus:outline-none focus:border-[#3d465c] transition leading-relaxed font-mono"
            />
          </div>

          <button
            onClick={handleRunMatch}
            disabled={isMatching || !jobDescription}
            className="w-full py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-xs hover:bg-[#e4e7eb] transition cursor-pointer disabled:opacity-40"
          >
            {isMatching ? "Comparing Schemas..." : "Execute Alignment Audit"}
          </button>
        </div>

        {/* Right Column: Match Diagnostic Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Match Score Overview Card */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2330]">
              <div>
                <span className="text-[11px] font-mono text-[#6b7585] uppercase tracking-wider">Position Compatibility</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {matchResult.match_data.overall_match}%
                  </span>
                  <span className="text-xs text-[#6b7585] font-mono">Overall Match</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#6b7585] block text-[10px]">Skills</span>
                  <span className="text-emerald-400 font-semibold">{matchResult.match_data.sub_scores.skills}%</span>
                </div>
                <div>
                  <span className="text-[#6b7585] block text-[10px]">Experience</span>
                  <span className="text-blue-400 font-semibold">{matchResult.match_data.sub_scores.experience}%</span>
                </div>
                <div>
                  <span className="text-[#6b7585] block text-[10px]">Education</span>
                  <span className="text-white font-semibold">{matchResult.match_data.sub_scores.education}%</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#c4ccd9] mt-3 leading-relaxed">
              {matchResult.match_data.fit_summary}
            </p>
          </div>

          {/* Keyword Alignment (Matched vs Missing) */}
          <div className="surface-card p-5 space-y-4">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
              ATS Keyword Alignment Matrix
            </h2>

            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Found in Candidate Resume ({matchResult.match_data.matching_skills.length}):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.match_data.matching_skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-[#112015] border border-[#1b3e24] text-emerald-300 font-mono text-[11px]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#1b202c]">
              <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>Missing from Resume Keywords ({matchResult.match_data.missing_skills.length}):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.match_data.missing_skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-[#1e1215] border border-[#3b1b20] text-rose-300 font-mono text-[11px]">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Adjustments */}
          <div className="surface-card p-5">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Resume Tailoring Recommendations
            </h2>

            <div className="space-y-3">
              {matchResult.match_data.actionable_fixes.map((fix, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0e1117] border border-[#1f2533] text-xs">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-[#1b212f] text-center text-[10px] font-mono leading-4">
                      {idx + 1}
                    </span>
                    <span>{fix.action}</span>
                  </h4>
                  <p className="text-[#8c96a8] leading-relaxed pl-6">
                    {fix.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#1b202c] flex justify-end">
              <button
                onClick={onStartInterview}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1a202c] hover:bg-[#252d3d] text-white text-xs font-medium transition cursor-pointer"
              >
                <span>Proceed to Tailored Interview Prep</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
