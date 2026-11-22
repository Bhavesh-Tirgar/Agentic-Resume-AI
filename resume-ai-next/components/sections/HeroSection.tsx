"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SquaresBackground } from "@/components/ui/SquaresBackground";
import { ShinyText } from "@/components/ui/ShinyText";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { AmbientAura } from "@/components/ui/AmbientAura";
import { 
  ArrowRight, Upload, CheckCircle2, Shield, 
  Sparkles, Briefcase, TrendingUp, DollarSign, Layers
} from "lucide-react";
import { luxuryEasing } from "@/lib/motion";

interface HeroSectionProps {
  onScanClick?: () => void;
  onOpenStudio?: () => void;
  onFileSelected?: (file: File) => void;
}

type IndustryKey = "tech" | "sales" | "finance" | "marketing";

interface ProfileData {
  title: string;
  domain: string;
  score: number;
  grade: string;
  skills: string[];
  weakBullet: string;
  strongBullet: string;
  impact: string;
}

const SAMPLE_PROFILES: Record<IndustryKey, ProfileData> = {
  tech: {
    title: "Senior Cloud & Systems Engineer",
    domain: "Engineering & Tech",
    score: 93,
    grade: "Tier-1 Competitive",
    skills: ["Python", "TypeScript", "React", "Docker", "PostgreSQL", "REST APIs"],
    weakBullet: "Built APIs and database features for web applications.",
    strongBullet: "Architected 14+ high-throughput REST APIs, reducing p99 latency to <45ms and sustaining 18,000 active daily users.",
    impact: "+36% ATS Score Impact"
  },
  sales: {
    title: "Senior Enterprise B2B Account Executive",
    domain: "Sales & Revenue",
    score: 95,
    grade: "Top 4% Sales Tier",
    skills: ["B2B Negotiation", "Salesforce CRM", "Pipeline Growth", "Contract Closing", "Enterprise RFPs"],
    weakBullet: "Managed sales leads, met clients, and closed deals.",
    strongBullet: "Generated $3.4M in net new ARR by expanding 28 enterprise accounts, exceeding annual target quota by 142%.",
    impact: "+42% ATS Score Impact"
  },
  finance: {
    title: "Senior Financial Analyst & Controller",
    domain: "Finance & Accounting",
    score: 92,
    grade: "Executive Qualified",
    skills: ["Financial Modeling", "Budget Forecasting", "GAAP Compliance", "Statutory Audit", "ERP Systems"],
    weakBullet: "Handled company accounting entries, ledgers, and monthly tax filing.",
    strongBullet: "Spearheaded quarterly financial audits across $42M in assets with zero variances, optimizing operating expenses by 18%.",
    impact: "+38% ATS Score Impact"
  },
  marketing: {
    title: "Growth Marketing Director",
    domain: "Marketing & Growth",
    score: 94,
    grade: "High Growth Match",
    skills: ["Omni-Channel Acquisition", "Google Ads", "Meta Ads Manager", "SEO & CRO", "Attribution Modeling"],
    weakBullet: "Ran social media marketing campaigns and managed ads budget.",
    strongBullet: "Scaled organic and paid customer acquisition funnels by 320% while reducing blended Customer Acquisition Cost (CAC) by 34%.",
    impact: "+44% ATS Score Impact"
  }
};

export function HeroSection({ onScanClick, onOpenStudio, onFileSelected }: HeroSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<IndustryKey>("tech");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (onFileSelected) {
        onFileSelected(file);
      } else if (onScanClick) {
        onScanClick();
      }
    }
  };

  const current = SAMPLE_PROFILES[activeTab];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Architectural Grid */}
      <SquaresBackground direction="diagonal" speed={0.3} squareSize={48} />
      <AmbientAura variant="hero" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Copy & Actions (7 Cols) */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-5">
          
          {/* Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: luxuryEasing }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#12151c] border border-slate-200 dark:border-[#202532] shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <ShinyText
              text="AI-Powered Career & Placement Platform"
              className="text-xs font-medium tracking-wide"
              speed={4}
            />
          </motion.div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Resumes engineered to beat the ATS and win interviews.
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: luxuryEasing }}
            className="text-sm sm:text-base text-slate-600 dark:text-[#949ca8] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
          >
            Instant ATS diagnostic scoring, quantifiable bullet rewrites, and nearby job matching for professionals across all industries — Tech, Sales, Finance, Marketing & Operations.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: luxuryEasing }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2"
          >
            {/* Primary Action */}
            <button
              onClick={onOpenStudio || onScanClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white dark:text-black bg-slate-900 dark:bg-white hover:opacity-90 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Launch ATS Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Secondary Action */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 bg-white dark:bg-[#12151c] border border-slate-200 dark:border-[#202533] hover:bg-slate-50 dark:hover:bg-[#181d26] transition cursor-pointer shadow-xs active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF to Scan</span>
            </button>
          </motion.div>

          {/* Minimal Trust Signals */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] font-mono text-slate-400 dark:text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tested on Workday & Lever</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Private & Ephemeral</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
              <span>Universal Industry Calibration</span>
            </span>
          </div>

        </div>

        {/* Right Interactive Multi-Industry Scorecard (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <TiltedCard maxAngle={6} className="w-full max-w-md">
            <div className="relative rounded-xl border border-slate-200 dark:border-[#202533] bg-white dark:bg-[#111318] p-5 shadow-xl transition-colors space-y-3.5">
              
              {/* Industry Switcher Tabs */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[#1b1f2b]">
                <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
                  Select Field:
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0c0e14] p-0.5 rounded-md text-[10px] font-medium">
                  {(["tech", "sales", "finance", "marketing"] as IndustryKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-2 py-0.5 rounded transition cursor-pointer capitalize ${
                        activeTab === key
                          ? "bg-white dark:bg-[#1e2330] text-slate-900 dark:text-white font-semibold shadow-xs"
                          : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header with Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#171a23] border border-slate-200 dark:border-[#262c3b] flex items-center justify-center text-slate-900 dark:text-white font-mono text-xs font-bold">
                    {current.score}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{current.title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">{current.domain}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {current.grade}
                </span>
              </div>

              {/* Parsed Competency Badges */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 block">
                  Audited Domain Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {current.skills.map((kw, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#151922] border border-slate-200 dark:border-[#202533] text-[10px] font-mono text-slate-700 dark:text-zinc-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantified Bullet Calibration */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 block">
                  Live Bullet Point Calibration
                </span>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-100 dark:border-[#1a1f2b] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                    <span className="text-rose-500 line-through truncate max-w-[200px]">"{current.weakBullet}"</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{current.impact}</span>
                  </div>
                  <p className="text-xs text-slate-900 dark:text-zinc-200 font-medium leading-relaxed">
                    "{current.strongBullet}"
                  </p>
                </div>
              </div>

              {/* Interactive Try Button */}
              <button
                onClick={onOpenStudio || onScanClick}
                className="w-full py-1.5 rounded-lg bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 text-[11px] font-medium border border-slate-200 dark:border-[#232936] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Test this profile in ATS Studio</span>
              </button>

            </div>
          </TiltedCard>
        </div>

      </div>
    </section>
  );
}
