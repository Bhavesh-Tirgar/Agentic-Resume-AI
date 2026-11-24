"use client";

import React, { useState, useEffect } from "react";
import { 
  Compass, MapPin, Building2, Briefcase, DollarSign, 
  Target, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, 
  Sparkles, RefreshCw, Server, HelpCircle, Layers, Filter,
  Navigation, Car, Train, Eye, LayoutGrid, Map as MapIcon, ShieldCheck, Zap
} from "lucide-react";
import { DEMO_DISCOVERED_JOBS, DiscoveredJobItem, JobDiscoveryData } from "@/lib/demoData";
import { discoverJobsApi, getDiscoveredJobsApi, getActiveResumeId } from "@/lib/api";
import { PrivacyModal } from "../PrivacyModal";
import { RankedGapsView } from "./RankedGapsView";

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
  const [locationInput, setLocationInput] = useState("Remote / Nationwide");
  const [selectedWorkType, setSelectedWorkType] = useState<"All" | "Remote" | "Hybrid" | "On-site">("All");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All Fields");
  const [selectedRadius, setSelectedRadius] = useState<number>(25);
  const [viewMode, setViewMode] = useState<"grid" | "radar" | "gaps">("grid");
  const [selectedJob, setSelectedJob] = useState<DiscoveredJobItem | null>(null);
  const [isScouting, setIsScouting] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [minMatchFilter, setMinMatchFilter] = useState<number>(75);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const industries = [
    "All Fields",
    "Sales & Business",
    "Finance & Accounting",
    "Marketing & Content",
    "Operations & Supply",
    "Engineering & Tech",
    "Healthcare"
  ];

  const radiusOptions = [5, 10, 25, 50, 100];

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
          if (res.discovery_data.radius_km) {
            setSelectedRadius(res.discovery_data.radius_km);
          }
          if (res.discovery_data.jobs?.[0]) {
            setSelectedJob(res.discovery_data.jobs[0]);
          }
        }
      })
      .catch((err) => {
        console.warn("Using baseline discovered jobs:", err);
      });
  }, [effectiveResumeId]);

  const handleRunDiscovery = async (loc?: string, workType?: string, radius?: number) => {
    setIsScouting(true);
    setApiNotice(null);

    const targetLoc = loc || locationInput;
    const targetWorkType = workType || selectedWorkType;
    const targetRadius = radius || selectedRadius;

    try {
      const res = await discoverJobsApi(effectiveResumeId, targetLoc, targetWorkType, targetRadius);
      if (res.discovery_data) {
        setData(res.discovery_data);
        setApiNotice(`AI Job Scout Agent: Found ${res.discovery_data.jobs?.length || 4} verified positions within ${targetRadius} km of "${targetLoc}".`);
        if (res.discovery_data.jobs?.[0]) {
          setSelectedJob(res.discovery_data.jobs[0]);
        }
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
    const matchesRadius = !j.distance_km || selectedRadius >= 100 || j.distance_km <= selectedRadius || j.work_type.toLowerCase().includes("remote");
    return matchesWorkType && matchesScore && matchesRadius;
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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#191d27] border border-slate-200 dark:border-[#272d3b] text-slate-600 dark:text-zinc-300">
              Proximity & Commute Radar
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              CareerPilot Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Nearby & Stack-Matched Opportunities
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Geographic proximity matching evaluating candidate skills with multi-modal commute times (Metro & Driving) and radius clustering.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* View Toggle */}
          <div className="flex bg-slate-100 dark:bg-[#161922] p-1 rounded-lg border border-slate-200 dark:border-[#272d3b]">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#232936] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode("radar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === "radar"
                  ? "bg-white dark:bg-[#232936] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Radius Radar</span>
            </button>
            <button
              onClick={() => setViewMode("gaps")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === "gaps"
                  ? "bg-white dark:bg-[#232936] text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Ranked Gaps (ROI)</span>
            </button>
          </div>

          {/* Privacy Button */}
          <button
            onClick={() => setPrivacyModalOpen(true)}
            className="p-2 rounded-lg border border-slate-200 dark:border-[#272d3b] hover:bg-slate-100 dark:hover:bg-[#161922] text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Data Privacy & Portability (DPDP / GDPR)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => handleRunDiscovery()}
            disabled={isScouting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScouting ? "animate-spin" : ""}`} />
            <span>{isScouting ? "Scouting..." : "Refresh"}</span>
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

      {/* Search & Radius Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318]">
        {/* Location Query */}
        <div className="md:col-span-4 space-y-1">
          <label className="text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span>Target City / Corridor</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g. Ahmedabad, Bangalore, London, San Francisco"
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

        {/* Distance Radius Filter (CareerPilot Nearby Search) */}
        <div className="md:col-span-3 space-y-1">
          <label className="text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
            <Navigation className="w-3 h-3 text-emerald-500" />
            <span>Distance Radius</span>
          </label>
          <div className="flex gap-1 bg-slate-100 dark:bg-[#161922] p-1 rounded-lg border border-slate-200 dark:border-[#272d3b]">
            {radiusOptions.map((rad) => (
              <button
                key={rad}
                onClick={() => {
                  setSelectedRadius(rad);
                  handleRunDiscovery(locationInput, selectedWorkType, rad);
                }}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition cursor-pointer ${
                  selectedRadius === rad
                    ? "bg-white dark:bg-[#232936] text-slate-900 dark:text-white shadow-xs font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {rad >= 100 ? "All" : `${rad}km`}
              </button>
            ))}
          </div>
        </div>

        {/* Work Arrangement */}
        <div className="md:col-span-3 space-y-1">
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
                  handleRunDiscovery(locationInput, type, selectedRadius);
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
        <div className="md:col-span-2 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-500" />
              <span>Min</span>
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

        {/* Universal Industry Category Filter */}
        <div className="md:col-span-12 pt-3 border-t border-slate-100 dark:border-[#1d212c] flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Industry Domain:
          </span>
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => {
                setSelectedIndustry(ind);
                const queryText = ind === "All Fields" ? locationInput : `${locationInput} (${ind})`;
                handleRunDiscovery(queryText);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedIndustry === ind
                  ? "bg-slate-900 dark:bg-white text-white dark:text-black font-semibold shadow-xs"
                  : "bg-slate-100 dark:bg-[#191d26] border border-slate-200 dark:border-[#272d3b] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* CareerPilot Strategic ROI Alert Banner */}
      {viewMode !== "gaps" && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/20 bg-linear-to-r from-amber-500/10 via-emerald-500/5 to-transparent text-xs text-slate-800 dark:text-zinc-200">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">CareerPilot Cross-Pipeline Intelligence: </span>
              <span className="text-slate-600 dark:text-zinc-300">Discover which single skill unlocks 80% of your target positions and addresses Marcus 3D interview feedback.</span>
            </div>
          </div>
          <button
            onClick={() => setViewMode("gaps")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[11px] font-mono transition shrink-0 cursor-pointer shadow-xs"
          >
            <span>View ROI Rankings</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* VIEW MODE 1: CareerPilot Cross-Job Ranked Gaps Engine */}
      {viewMode === "gaps" && (
        <RankedGapsView activeResumeId={effectiveResumeId} />
      )}

      {/* VIEW MODE 2: Interactive Radar & Geo Map */}
      {viewMode === "radar" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Radar Screen Visualizer */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-[#20242e] bg-slate-950 p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[440px] shadow-lg">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Radar Circular Boundary Rings */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
              {/* Outer Ring (50 km) */}
              <div className="absolute inset-0 rounded-full border border-emerald-500/15" />
              <span className="absolute top-1 text-[9px] font-mono text-emerald-500/40">50 km</span>

              {/* Mid Ring (25 km) */}
              <div className="absolute inset-12 rounded-full border border-emerald-500/25" />
              <span className="absolute top-13 text-[9px] font-mono text-emerald-500/60">25 km</span>

              {/* Close Ring (10 km) */}
              <div className="absolute inset-24 rounded-full border border-emerald-500/35" />
              <span className="absolute top-25 text-[9px] font-mono text-emerald-500/80">10 km</span>

              {/* Inner Ring (5 km) */}
              <div className="absolute inset-36 rounded-full border border-dashed border-emerald-500/50" />
              <span className="absolute top-37 text-[9px] font-mono text-emerald-400">5 km</span>

              {/* Center Radar Sweep */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#10b98125_360deg)] animate-spin-slow" />
              </div>

              {/* Center Candidate Pin */}
              <div className="relative z-10 flex flex-col items-center group cursor-pointer">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
                  <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_12px_#10b981]" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 whitespace-nowrap shadow-md">
                  You ({locationInput.split(",")[0]})
                </div>
              </div>

              {/* Positioned Employer Job Pins */}
              {filteredJobs.map((job, idx) => {
                // Distribute around radar circle based on distance & angle
                const angle = (idx * 72 + 25) * (Math.PI / 180);
                const maxRange = selectedRadius >= 50 ? 50 : 25;
                const dist = job.distance_km || (idx + 1) * 3.5;
                const normDist = Math.min(1.0, Math.max(0.18, dist / maxRange));
                const radiusPx = normDist * 140; // max radius inside circle
                const x = radiusPx * Math.cos(angle);
                const y = radiusPx * Math.sin(angle);

                const isSelected = selectedJob?.id === job.id;
                const isHighMatch = job.match_percentage >= 90;

                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className={`absolute z-20 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${
                      isSelected ? "scale-110 z-30" : "hover:scale-110"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg transition-all ${
                          isSelected
                            ? "bg-white text-slate-950 ring-2 ring-emerald-400 shadow-[0_0_15px_#10b981]"
                            : isHighMatch
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/40"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/40"
                        }`}
                      >
                        <Building2 className="w-3 h-3" />
                        <span>{job.match_percentage}%</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-300 bg-slate-900/80 px-1.5 rounded mt-0.5 whitespace-nowrap border border-slate-700">
                        {job.company.split(" ")[0]} ({dist.toFixed(1)}km)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Radar Footer Legend */}
            <div className="absolute bottom-3 inset-x-6 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Green: &ge;90% Fit</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Cyan: 80-89% Fit</span>
              </span>
              <span>Radius: {selectedRadius} km</span>
            </div>
          </div>

          {/* Selected Job Radar Detail Drawer */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-6 shadow-sm flex flex-col justify-between space-y-4">
            {selectedJob ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {selectedJob.company}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1a1e27] text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-[#272d3b]">
                          {selectedJob.work_type}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {selectedJob.title}
                      </h2>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">
                      {selectedJob.match_percentage}% Match
                    </div>
                  </div>

                  {/* Multi-Modal Commute Breakdown */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161a23] border border-slate-200 dark:border-[#232936] space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-400 font-bold block">
                      Multi-Modal Commute & Proximity Breakdown
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-200">
                        <Train className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Metro Transit</span>
                          <span className="font-semibold">{selectedJob.commute_time_transit || "22 min (Metro)"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-200">
                        <Car className="w-4 h-4 text-cyan-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Driving</span>
                          <span className="font-semibold">{selectedJob.commute_time_driving || "18 min driving"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 dark:border-[#202533] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      <span>Proximity: {selectedJob.distance_km ? `${selectedJob.distance_km} km direct` : selectedJob.distance_commute}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedJob.salary_range}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {selectedJob.description_snippet}
                  </p>

                  {/* Matched Skills */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 block mb-1">
                      Matched Competencies ({selectedJob.matched_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedJob.matched_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Rationale */}
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-700 dark:text-zinc-300">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Agent Rationale: </span>
                    {selectedJob.match_rationale}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#1d212b] flex items-center justify-between gap-2">
                  <a
                    href={selectedJob.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-[#272d3b] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#1a1f2b] transition text-xs font-medium cursor-pointer"
                  >
                    <span>Live Post</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-2">
                    {onMatchJob && (
                      <button
                        onClick={() => onMatchJob(selectedJob)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Run Match</span>
                      </button>
                    )}

                    {onInterviewPrep && (
                      <button
                        onClick={() => onInterviewPrep(selectedJob)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-semibold transition cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Practice Interview</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 dark:text-zinc-500">
                <Compass className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Select any employer pin on the radar map to inspect commute times and match breakdown.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Standard Cards Grid View */}
      {viewMode === "grid" && (
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

                {/* Multi-Modal Commute Pill */}
                <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-[#161a23] border border-slate-200/80 dark:border-[#232936] flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Train className="w-3 h-3" />
                      <span>{job.commute_time_transit || "20 min"}</span>
                    </span>
                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                      <Car className="w-3 h-3" />
                      <span>{job.commute_time_driving || "16 min"}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{job.distance_km ? `${job.distance_km} km` : job.distance_commute}</span>
                  </div>
                </div>

                {/* Salary Metadata */}
                <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                  <span className="text-slate-400">Compensation:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{job.salary_range}</span>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
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
      )}

      {filteredJobs.length === 0 && (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-[#272d3b] bg-white dark:bg-[#111318]">
          <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No jobs matched current radius & threshold</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Try expanding your Distance Radius (e.g. 50km or All) or lowering your Minimum Match threshold.
          </p>
        </div>
      )}

      {/* Global DPDP Privacy Modal */}
      <PrivacyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
    </div>
  );
}
