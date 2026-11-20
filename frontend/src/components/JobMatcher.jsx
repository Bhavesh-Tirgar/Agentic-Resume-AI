import React, { useState } from "react";
import { Briefcase, Target, CheckCircle2, XCircle, ArrowRight, Sparkles, Loader2, Zap } from "lucide-react";
import { DEMO_JOB_MATCH } from "../api";

export default function JobMatcher({ onStartInterview }) {
  const [jobTitle, setJobTitle] = useState("Senior Full Stack AI Engineer");
  const [jobDescription, setJobDescription] = useState(
    "Looking for a Senior Full Stack Engineer with strong experience in Python, Django REST Framework, LangGraph, Generative AI agent workflows, React, and cloud systems (Docker/Kubernetes). Must have demonstrated experience building production-ready architectures."
  );
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(DEMO_JOB_MATCH);

  const handleMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setMatchResult(DEMO_JOB_MATCH);
    }, 1000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          Job Description Alignment
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Targeted Skill Gap & Match Analysis</h2>
        <p className="text-xs text-slate-400 mt-1">
          Paste any job description to let JobMatchingAgent compare your resume against the target role requirements.
        </p>
      </div>

      {/* Input / Match Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Target Role Specification</span>
          </h3>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Target Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#0b0e17] border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Senior AI Engineer"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Job Description (JD)</label>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#0b0e17] border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
              placeholder="Paste the target job description requirements here..."
            />
          </div>

          <button
            onClick={handleMatch}
            disabled={isMatching}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isMatching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running JobMatchingAgent...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Analyze Match Fit</span>
              </>
            )}
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Match Compatibility Score</span>
                <div className="text-2xl font-black text-white mt-0.5">{matchResult.job_title}</div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-2xl font-extrabold text-emerald-400">{matchResult.match_data.match_percentage}%</span>
                <span className="text-[11px] font-medium text-emerald-300 uppercase">Match</span>
              </div>
            </div>

            {/* Fit Summary */}
            <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-[#0e121e] p-3.5 rounded-xl border border-white/5">
              {matchResult.match_data.fit_summary}
            </p>

            {/* Skill Match Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Matched Skills */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matching Skills ({matchResult.match_data.matching_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.match_data.matching_skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[11px] rounded bg-emerald-900/40 text-emerald-200 border border-emerald-800/40 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <XCircle className="w-4 h-4" />
                  <span>Missing Gaps ({matchResult.match_data.missing_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.match_data.missing_skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[11px] rounded bg-amber-900/40 text-amber-200 border border-amber-800/40 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Resume Optimization Strategy</span>
              {matchResult.match_data.recommendations.map((rec, idx) => (
                <div key={idx} className="text-xs text-slate-400 flex items-start gap-2 bg-[#0e121e] p-2.5 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Next Step */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-400">Ready to prepare for this specific role?</span>
            <button
              onClick={onStartInterview}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Role Interview Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
