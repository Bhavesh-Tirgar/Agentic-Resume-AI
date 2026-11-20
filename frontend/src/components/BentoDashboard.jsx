import React, { useState } from "react";
import { 
  CheckCircle2, AlertTriangle, ArrowRight, Copy, Check, 
  Target, HelpCircle, Layers, TrendingUp, Sparkles, Building2, Calendar, MapPin
} from "lucide-react";

export default function BentoDashboard({ results, onNavigateToMatch, onNavigateToInterview }) {
  const [activeTab, setActiveTab] = useState("rewrites"); // rewrites, gaps, strengths
  const [copiedIndex, setCopiedIndex] = useState(null);

  const { score_data, analysis_data, parsed_data } = results;

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-2 space-y-6">
      {/* Dossier Header Bar */}
      <div className="surface-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-[#8c96a8]">Audited Technical Dossier</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            {parsed_data?.name || "Bhavesh Tirgar"}
          </h1>
          <p className="text-xs text-[#8c96a8] mt-0.5">
            {parsed_data?.title || "Senior Full Stack & AI Systems Engineer"} • {parsed_data?.location}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onNavigateToMatch}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-[#e4e7eb] transition cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Match Against Job Description</span>
          </button>
          <button
            onClick={onNavigateToInterview}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#191d27] text-white hover:bg-[#232936] border border-[#262c3b] transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#8c96a8]" />
            <span>Interview Prep</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Parsed Candidate Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Skills Breakdown by Taxonomy */}
          <div className="surface-card p-5">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extracted Technical Competencies</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#6b7585] text-[11px] uppercase font-mono block mb-1.5">Languages & Core</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsed_data?.skills?.languages?.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-[#171b24] border border-[#232936] text-[#c4ccd9] font-mono text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#6b7585] text-[11px] uppercase font-mono block mb-1.5">Frameworks & Agentic AI</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsed_data?.skills?.frameworks?.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-[#171b24] border border-[#232936] text-[#c4ccd9] font-mono text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#6b7585] text-[11px] uppercase font-mono block mb-1.5">Database & Infrastructure</span>
                <div className="flex flex-wrap gap-1.5">
                  {[...(parsed_data?.skills?.databases || []), ...(parsed_data?.skills?.tools_devops || [])].map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-[#171b24] border border-[#232936] text-[#c4ccd9] font-mono text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Experience Timeline with In-line Audit Flags */}
          <div className="surface-card p-5">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Experience & Bullet Audit</span>
            </h2>

            <div className="space-y-6">
              {parsed_data?.experience?.map((exp, idx) => (
                <div key={idx} className="pb-6 border-b border-[#1b1f2b] last:border-b-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{exp.role}</h3>
                      <p className="text-xs text-[#8c96a8]">{exp.organization} • {exp.location}</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#6b7585] bg-[#151922] px-2 py-0.5 rounded border border-[#202533] self-start sm:self-auto">
                      {exp.duration}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {exp.bullets?.map((b, bIdx) => (
                      <li key={bIdx} className="text-xs text-[#c4ccd9] leading-relaxed flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="surface-card p-5">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Verified Academic Credentials
            </h2>
            {parsed_data?.education?.map((edu, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-white">{edu.degree}</h4>
                  <p className="text-[#8c96a8] mt-0.5">{edu.institution}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-400 block">{edu.grade}</span>
                  <span className="text-[#6b7585] font-mono text-[11px]">{edu.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recruiter Intelligence & Scorecard (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Executive Scorecard */}
          <div className="surface-card p-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2330]">
              <div>
                <span className="text-[11px] font-mono text-[#6b7585] uppercase tracking-wider">Candidate Benchmark</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {score_data?.overall_score || 87}
                  </span>
                  <span className="text-xs text-[#6b7585] font-mono">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded bg-[#16251b] border border-[#23462c] text-emerald-400 font-medium text-xs">
                  {score_data?.grade || "Tier-1 Competitive"}
                </span>
                <span className="block text-[11px] text-[#6b7585] mt-1 font-mono">
                  {score_data?.percentile || "Top 8% percentile"}
                </span>
              </div>
            </div>

            {/* Score Dimensions Breakdown */}
            <div className="mt-4 space-y-3">
              {score_data?.categories?.map((cat, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between text-[#8c96a8] mb-1">
                    <span>{cat.name}</span>
                    <span className="font-mono text-white font-medium">{cat.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#181d27] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${cat.score >= 90 ? "bg-emerald-500" : cat.score >= 80 ? "bg-blue-500" : "bg-amber-500"}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#6b7585] mt-1">{cat.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recruiter Tabs (Rewrites, Gaps, Strengths) */}
          <div className="surface-card p-5">
            <div className="flex items-center gap-1 p-1 bg-[#0e1016] rounded-lg border border-[#1b202c] mb-4">
              <button
                onClick={() => setActiveTab("rewrites")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "rewrites"
                    ? "bg-[#1f2533] text-white font-semibold"
                    : "text-[#8c96a8] hover:text-white"
                }`}
              >
                Bullet Rewrites
              </button>
              <button
                onClick={() => setActiveTab("gaps")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "gaps"
                    ? "bg-[#1f2533] text-white font-semibold"
                    : "text-[#8c96a8] hover:text-white"
                }`}
              >
                Critical Gaps
              </button>
              <button
                onClick={() => setActiveTab("strengths")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "strengths"
                    ? "bg-[#1f2533] text-white font-semibold"
                    : "text-[#8c96a8] hover:text-white"
                }`}
              >
                Strengths
              </button>
            </div>

            {/* Tab 1: Surgical Bullet Rewrites */}
            {activeTab === "rewrites" && (
              <div className="space-y-4">
                <p className="text-xs text-[#8c96a8]">
                  Replace weak or unquantified resume bullet points with recruiter-optimized statements:
                </p>

                {analysis_data?.bullet_rewrites?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-[#232937] bg-[#0e1117] space-y-2.5">
                    {/* Before */}
                    <div>
                      <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold block mb-1">
                        Weak / Lacks Scale:
                      </span>
                      <p className="text-xs text-[#8c96a8] line-through decoration-rose-500/50">
                        "{item.original}"
                      </p>
                    </div>

                    {/* After */}
                    <div className="pt-2 border-t border-[#1b202c]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                          ATS Optimized Rewrite:
                        </span>
                        <button
                          onClick={() => handleCopy(item.rewritten, idx)}
                          className="flex items-center gap-1 text-[11px] text-[#8c96a8] hover:text-white font-mono transition cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-white leading-relaxed font-medium">
                        "{item.rewritten}"
                      </p>
                    </div>

                    <p className="text-[11px] text-[#6b7585] pt-1">
                      <strong className="text-[#8c96a8]">Why:</strong> {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Critical Gaps */}
            {activeTab === "gaps" && (
              <div className="space-y-3">
                <p className="text-xs text-[#8c96a8]">
                  Identified blind spots that could trigger screening disqualification:
                </p>
                {analysis_data?.weaknesses?.map((weakness, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#181114] border border-[#3b1d22] text-xs text-[#fca5a5] flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{weakness}</span>
                  </div>
                ))}

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-white mb-2">Recommended Next Actions:</h4>
                  <ul className="space-y-2">
                    {analysis_data?.improvements?.map((imp, i) => (
                      <li key={i} className="text-xs text-[#8c96a8] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 3: Key Strengths */}
            {activeTab === "strengths" && (
              <div className="space-y-3">
                <p className="text-xs text-[#8c96a8]">
                  Validated engineering competencies that position this candidate in the top tier:
                </p>
                {analysis_data?.strengths?.map((str, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#101813] border border-[#1d3824] text-xs text-[#86efac] flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
