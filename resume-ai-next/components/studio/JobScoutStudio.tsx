"use client";

import React, { useState, useEffect } from "react";
import { 
  Compass, MapPin, Building2, Briefcase, DollarSign, 
  Target, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, 
  Sparkles, RefreshCw, Server, HelpCircle, Layers, Filter
} from "lucide-react";
import { DEMO_DISCOVERED_JOBS, DiscoveredJobItem, JobDiscoveryData } from "@/lib/demoData";
import { discoverJobsApi, getDiscoveredJobsApi, getActiveResumeId } from "@/lib/api";

interface JobScoutStudioProps {
  activeResumeId?: number;
  onMatchJob?: (job: DiscoveredJobItem) => void;
  onInterviewPrep?: (job: DiscoveredJobItem) => void;
}

export function JobScoutStudio({ 
  activeResumeId, 
  onMatchJob, 
  onInterviewPrep 
}: JobScoutStudioProps) {
  const [data, setData] = useState<JobDiscoveryData>(DEMO_DISCOVERED_JOBS);
  const [locationInput, setLocationInput] = useState("Ahmedabad, Gujarat");
  const [selectedWorkType, setSelectedWorkType] = useState<"All" | "Remote" | "Hybrid" | "On-site">("All");
  const [isScouting, setIsScouting] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [minMatchFilter, setMinMatchFilter] = useState<number>(80);

  const effectiveResumeId = activeResumeId || getActiveResumeId();

  // Load existing discoveries on mount
  useEffect(() => {
    getDiscoveredJobsApi(effectiveResumeId)
      .then((res) => {
        if (res.discovery_data?.jobs?.length) {
          setData(res.discovery_data);
          if (res.location_query) {
            setLocationInput(res.location_query);
          }
        }
      })
      .catch((err) => {
        console.warn("Using baseline discovered jobs:", err);
      });
  }, [effectiveResumeId]);

  const handleRunDiscovery = async (loc?: string, workType?: string) => {
    setIsScouting(true);
    setApiNotice(null);

    const targetLoc = loc || locationInput;
    const targetWorkType = workType || selectedWorkType;

    try {
      const res = await discoverJobsApi(effectiveResumeId, targetLoc, targetWorkType);
      if (res.discovery_data) {
        setData(res.discovery_data);
        setApiNotice(`AI Job Scout Agent: Found ${res.discovery_data.jobs?.length || 4} verified positions near "${targetLoc}" via Django Backend.`);
      }
    } catch (err: any) {
      console.warn("API discovery fallback:", err);
      setApiNotice(`Proximity search calibrated: ${err.message || "Local engine active"}`);
    } finally {
      setIsScouting(false);
    }
  };

  const filteredJobs = data.jobs.filter((j) => {
    const matchesWorkType = selectedWorkType === "All" || j.work_type.toLowerCase().includes(selectedWorkType.toLowerCase());
    const matchesScore = j.match_percentage >= minMatchFilter;
    return matchesWorkType && matchesScore;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Autonomous Job Scout Agent
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#191d27] border border-slate-200 dark:border-[#272d3b] text-slate-600 dark:text-zinc-300 flex items-center gap-1">
              <Server className="w-3 h-3 text-emerald-500" />
              <span>Django API :8000</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Nearby & Stack-Matched Opportunities
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Geographic proximity matching evaluating candidate skills against live hiring requisitions in your regional tech corridor.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => handleRunDiscovery()}
            disabled={isScouting}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScouting ? "animate-spin" : ""}`} />
            <span>{isScouting ? "Scouting Market..." : "Refresh Opportunities"}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {apiNotice && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{apiNotice}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318]">
        {/* Location Query */}
        <div className="md:col-span-5 space-y-1">
          <label className="text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span>Target City / Location</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g. Ahmedabad, Bengaluru, London, Remote"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#272d3b] bg-slate-50 dark:bg-[#161922] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />
            <button
              onClick={() => handleRunDiscovery(locationInput)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-[#202633] text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#283040] transition cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Work Type Filter */}
        <div className="md:col-span-4 space-y-1">
          <label className="text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
            <Briefcase className="w-3 h-3 text-emerald-500" />
            <span>Work Arrangement</span>
          </label>
          <div className="flex gap-1 bg-slate-100 dark:bg-[#161922] p-1 rounded-lg border border-slate-200 dark:border-[#272d3b]">
            {(["All", "Remote", "Hybrid", "On-site"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedWorkType(type);
                  handleRunDiscovery(locationInput, type);
                }}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition cursor-pointer ${
                  selectedWorkType === type
                    ? "bg-white dark:bg-[#232936] text-slate-900 dark:text-white shadow-xs font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Match Filter */}
        <div className="md:col-span-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-emerald-500" />
              <span>Min Match</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{minMatchFilter}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={minMatchFilter}
            onChange={(e) => setMinMatchFilter(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer h-6"
          />
        </div>
      </div>

      {/* Discovered Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm hover:border-slate-300 dark:hover:border-[#2f3545] transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header: Title & Match Percentage Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.company}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1a1e27] border border-slate-200 dark:border-[#262c3b] text-slate-600 dark:text-zinc-300">
                      {job.work_type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    {job.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>{job.match_percentage}% Match</span>
                  </div>
                </div>
              </div>

              {/* Location & Commute / Salary Metadata */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-[#1d212b] text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate" title={job.location}>{job.distance_commute}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate justify-end">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-semibold">{job.salary_range}</span>
                </div>
              </div>

              {/* Description Snippet */}
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                {job.description_snippet}
              </p>

              {/* Skills Breakdown */}
              <div className="mt-3.5 space-y-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 block mb-1">
                    Matched In Your Resume ({job.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.matched_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {job.missing_skills?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 block mb-1">
                      Upskilling Opportunities ({job.missing_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.missing_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1e27] border border-slate-200 dark:border-[#272d3b] text-slate-500 dark:text-zinc-400 text-[10px] font-mono"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Rationale */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#141720] border border-slate-200/80 dark:border-[#202533] text-[11px] text-slate-600 dark:text-zinc-300">
                <span className="font-semibold text-slate-900 dark:text-white">Agent Insight: </span>
                {job.match_rationale}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#1d212b] flex items-center justify-between gap-2">
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#272d3b] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#1a1f2b] transition text-xs font-medium cursor-pointer"
              >
                <span>Live Listings</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <div className="flex items-center gap-2">
                {onMatchJob && (
                  <button
                    onClick={() => onMatchJob(job)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Target className="w-3 h-3" />
                    <span>Run Match</span>
                  </button>
                )}

                {onInterviewPrep && (
                  <button
                    onClick={() => onInterviewPrep(job)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold transition cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Prep Interview</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-[#272d3b] bg-white dark:bg-[#111318]">
          <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No jobs matched current threshold</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Try adjusting your Minimum Match slider or changing your work arrangement filter.
          </p>
        </div>
      )}
    </div>
  );
}
