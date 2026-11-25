"use client";

import React, { useState, useEffect } from "react";
import { 
  Target, CheckCircle2, AlertCircle, ArrowRight, 
  Layers, FileText, Check, Sparkles, RefreshCw, HelpCircle, Server, Copy,
  ShieldAlert, BookOpen, Clock, ArrowUpRight
} from "lucide-react";
import { JOB_ROLES_PRESETS, DEMO_JOB_MATCH_RESULT } from "@/lib/demoData";
import { matchJobApi, getActiveResumeId, getResumeProcessResultApi } from "@/lib/api";

interface JobMatchStudioProps {
  activeResumeId?: number;
  initialJobTitle?: string;
  initialJobDescription?: string;
  onStartInterview?: (matchId?: number) => void;
  onMatchComplete?: (matchId: number) => void;
}

export function JobMatchStudio({ 
  activeResumeId, 
  initialJobTitle, 
  initialJobDescription, 
  onStartInterview,
  onMatchComplete
}: JobMatchStudioProps) {
  const [selectedPreset, setSelectedPreset] = useState(JOB_ROLES_PRESETS[0].id);
  const [jobTitle, setJobTitle] = useState(initialJobTitle || JOB_ROLES_PRESETS[0].title);
  const [jobDescription, setJobDescription] = useState(initialJobDescription || JOB_ROLES_PRESETS[0].description);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(DEMO_JOB_MATCH_RESULT);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [backendOffline, setBackendOffline] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState<number>(1);
  const [candidateInfo, setCandidateInfo] = useState<{ name: string; skillsCount: number } | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Sync if initialJobTitle changes
  useEffect(() => {
    if (initialJobTitle) {
      setJobTitle(initialJobTitle);
      if (initialJobDescription) {
        setJobDescription(initialJobDescription);
      }
    }
  }, [initialJobTitle, initialJobDescription]);

  // Load candidate info
  useEffect(() => {
    const targetResumeId = activeResumeId || getActiveResumeId();
    getResumeProcessResultApi(targetResumeId)
      .then((res) => {
        if (res.parsed_data?.name) {
          setCandidateInfo({
            name: res.parsed_data.name,
            skillsCount: res.parsed_data.skills?.length || 0,
          });
        }
      })
      .catch(() => {});
  }, [activeResumeId]);

  const handleCopySummary = () => {
    const summary = `CareerPilot Job Alignment Report for "${jobTitle}":\nOverall Match: ${matchResult.overall_match_score}%\nSkill Match: ${matchResult.skill_match_score}%\nWhy It Matches: ${matchResult.why_matches || "Strong core competency overlap"}\nWhat Blocks: ${matchResult.what_blocks || "None"}\nRecommendations:\n${(matchResult.recommendations || []).map((r: string) => "- " + r).join("\n")}`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = JOB_ROLES_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setJobTitle(preset.title);
      setJobDescription(preset.description);
    }
  };

  const handleRunMatch = async () => {
    setIsMatching(true);
    setApiNotice(null);

    try {
      const targetResumeId = activeResumeId || getActiveResumeId();
      // Live Django REST Framework API Call
      const res = await matchJobApi(targetResumeId, jobTitle, jobDescription);
      const m = res.match_data || {};
      setActiveMatchId(res.job_match_id);
      onMatchComplete?.(res.job_match_id);

      setMatchResult({
        overall_match_score: m.overall_match_score ?? 0,
        skill_match_score: m.skill_match_score ?? 0,
        experience_match_score: m.experience_match_score ?? 0,
        education_match_score: m.education_match_score ?? 0,
        matched_skills: Array.isArray(m.matched_skills) ? m.matched_skills : [],
        missing_skills: Array.isArray(m.missing_skills) ? m.missing_skills : [],
        recommendations: Array.isArray(m.recommendations) ? m.recommendations : [],
        matched_evidence: Array.isArray(m.matched_evidence) ? m.matched_evidence : [],
        adjacent_matches: Array.isArray(m.adjacent_matches) ? m.adjacent_matches : [],
        structured_gaps: Array.isArray(m.structured_gaps) ? m.structured_gaps : [],
        why_matches: m.why_matches || "Match evaluation completed against job requirements.",
        what_blocks: m.what_blocks || "No critical blocking competency gaps detected.",
      });
      setBackendOffline(false);
      setApiNotice(`Live API Result: Evaluated against "${jobTitle}" via Django Backend (Match ID #${res.job_match_id})`);
    } catch (err: any) {
      console.warn("Backend match call fallback:", err);
      setBackendOffline(true);
      setApiNotice(`Backend Unreachable: ${err.message || "Failed to reach Django on port 8000"}`);
      setMatchResult(DEMO_JOB_MATCH_RESULT);
    } finally {
      setIsMatching(false);
    }
  };

  const isHardCapped = matchResult.overall_match_score <= 70 && (
    matchResult.what_blocks?.toLowerCase().includes("capped at 70") ||
    matchResult.what_blocks?.toLowerCase().includes("blocks qualification")
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              CareerPilot 3-Tier Matcher
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#191d27] border border-slate-200 dark:border-[#272d3b] text-slate-600 dark:text-zinc-300">
              0.6*MustHave + 0.2*NiceToHave
            </span>
            {candidateInfo && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Candidate: {candidateInfo.name} ({candidateInfo.skillsCount} skills)
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Job Match & Skill Gap Diagnostics
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Evaluates exact competencies, grants 0.6 partial credit for transferable adjacent stacks, and generates weekend bridge projects.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#272d3b] bg-white dark:bg-[#111318] text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#191d27] transition cursor-pointer"
            title="Copy match evaluation summary to clipboard"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? "Copied" : "Copy Report"}</span>
          </button>

          {onStartInterview && (
            <button
              onClick={() => onStartInterview(activeMatchId)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Practice Interview</span>
            </button>
          )}
        </div>
      </div>

      {backendOffline && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong>Offline Preview Mode:</strong> Unable to connect to Django API server on port 8000. Displaying cached reference data.</span>
          </div>
          <button
            onClick={handleRunMatch}
            disabled={isMatching}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-semibold text-[11px] font-mono hover:bg-amber-400 transition shrink-0 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {apiNotice && !backendOffline && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{apiNotice}</span>
        </div>
      )}

      {/* Preset Role Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
          Preset Roles:
        </span>
        {JOB_ROLES_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer shrink-0 ${
              selectedPreset === preset.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-sm"
                : "bg-white dark:bg-[#111318] text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-[#20242e] hover:border-slate-300 dark:hover:border-zinc-700"
            }`}
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Main Grid: Job Inputs (5 cols) vs. Gap Analysis (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Job Description Input */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5">
              Target Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#202533] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5">
              Job Requirements & Specification
            </label>
            <textarea
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#202533] text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600 leading-relaxed"
            />
          </div>

          <button
            onClick={handleRunMatch}
            disabled={isMatching}
            className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMatching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running CareerPilot 3-Tier Match...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Evaluate Compatibility & Gaps</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Match Analysis & Missing Keywords */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Executive CareerPilot Alignment Banner */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                CareerPilot Diagnostic Overview
              </span>
              {isHardCapped ? (
                <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Max-70 Hard Cap Active</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Calibrated Qualification
                </span>
              )}
            </div>

            {/* Score Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e13] border border-slate-100 dark:border-[#1a1e29]">
                <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Overall Match</p>
                <p className={`text-2xl font-bold mt-0.5 ${isHardCapped ? "text-amber-500" : "text-emerald-500"}`}>
                  {matchResult.overall_match_score}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e13] border border-slate-100 dark:border-[#1a1e29]">
                <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Skills Fit</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.skill_match_score}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e13] border border-slate-100 dark:border-[#1a1e29]">
                <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Experience</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.experience_match_score}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e13] border border-slate-100 dark:border-[#1a1e29]">
                <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Education</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.education_match_score}%</p>
              </div>
            </div>

            {/* Why it matches & What blocks */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1e222d] text-xs">
              {matchResult.why_matches && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold">Why You Match: </span>
                  <span>{matchResult.why_matches}</span>
                </div>
              )}
              {matchResult.what_blocks && (
                <div className={`p-2.5 rounded-lg border text-xs ${
                  isHardCapped 
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300 font-semibold"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                }`}>
                  <span className="font-bold">What Blocks Qualification: </span>
                  <span>{matchResult.what_blocks}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3-Tier Breakdown: Exact Matches & Transferable Adjacent Stacks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Matched Skills with Evidence */}
            <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Exact Matches ({matchResult.matched_skills.length})</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">1.0x Weight</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matched_skills.map((skill: string, idx: number) => {
                  const ev = (matchResult.matched_evidence || []).find((e: any) => e.skill.toLowerCase() === skill.toLowerCase());
                  const isStrong = ev?.evidence === "strong";
                  return (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono flex items-center gap-1"
                      title={ev ? `${skill}: ${ev.evidence} evidence in ${ev.where}` : skill}
                    >
                      <Check className="w-3 h-3" />
                      <span>{skill}</span>
                      {isStrong && <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">Exp</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Transferable Adjacent Stack (0.6x Credit) */}
            <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Adjacent Competencies</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">0.6x Credit</span>
              </h3>
              {matchResult.adjacent_matches?.length > 0 ? (
                <div className="space-y-2">
                  {matchResult.adjacent_matches.map((adj: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs font-mono flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200">
                        <span className="font-semibold text-cyan-700 dark:text-cyan-300">{adj.you_have}</span>
                        <span className="text-slate-400">&rarr;</span>
                        <span className="text-slate-500">{adj.jd_wants}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
                        +{Math.round(adj.credit * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-zinc-500 italic">
                  No adjacent skill substitutions required for this position.
                </p>
              )}
            </div>

          </div>

          {/* Actionable Gap Remediation Tasks (1-2 Weekends) */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>CareerPilot Action Tasks & Remediation Plan</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {(matchResult.recommendations || []).map((rec: string, idx: number) => (
                <li key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151821] border border-slate-200/80 dark:border-[#202533] flex items-start gap-2.5 text-slate-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <span className="leading-relaxed font-mono text-[11px]">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
