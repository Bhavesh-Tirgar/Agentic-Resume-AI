"use client";

import React, { useState, useEffect } from "react";
import { Navbar, NavTab } from "@/components/sections/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { SocialProofMarquee } from "@/components/sections/SocialProofMarquee";
import { FeaturesBento } from "@/components/sections/FeaturesBento";
import { BeforeAfterShowcase } from "@/components/sections/BeforeAfterShowcase";
import { AtsScannerSection } from "@/components/sections/AtsScannerSection";
import { PricingMatrix } from "@/components/sections/PricingMatrix";
import { FaqAndFooter } from "@/components/sections/FaqAndFooter";
import { AtsStudio } from "@/components/studio/AtsStudio";
import { JobMatchStudio } from "@/components/studio/JobMatchStudio";
import { JobScoutStudio } from "@/components/studio/JobScoutStudio";
import { InterviewStudio } from "@/components/studio/InterviewStudio";
import { DiscoveredJobItem } from "@/lib/demoData";
import { getActiveResumeId, setActiveResumeId as saveActiveResumeId } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [activeResumeId, setActiveResumeId] = useState<number | undefined>(undefined);
  const [activeJobMatchId, setActiveJobMatchId] = useState<number | undefined>(undefined);
  const [prefilledJob, setPrefilledJob] = useState<{ title: string; description: string } | null>(null);
  const [initialScanFile, setInitialScanFile] = useState<File | null>(null);

  useEffect(() => {
    const savedId = getActiveResumeId();
    if (savedId) {
      setActiveResumeId(savedId);
    }
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "studio" || hash === "matcher" || hash === "scout" || hash === "interview") {
        setCurrentTab(hash as NavTab);
      }
    }
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResumeUploaded = (id: number) => {
    setActiveResumeId(id);
    saveActiveResumeId(id);
  };

  const handleMatchFromScout = (job: DiscoveredJobItem) => {
    setPrefilledJob({
      title: job.title,
      description: `${job.title} at ${job.company} (${job.location}).\nRequirements & Overview: ${job.description_snippet}\nKey Skills: ${job.matched_skills.join(", ")}`,
    });
    handleTabChange("matcher");
  };

  const handleInterviewFromScout = (job: DiscoveredJobItem) => {
    setPrefilledJob({
      title: job.title,
      description: `${job.title} at ${job.company} (${job.location})`,
    });
    handleTabChange("interview");
  };

  const scrollToScanner = () => {
    if (currentTab !== "overview") {
      setCurrentTab("overview");
      setTimeout(() => {
        const el = document.getElementById("scanner");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById("scanner");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#090a0d] text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Floating Pill Island Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onUploadClick={scrollToScanner}
      />

      {/* Main Content Area */}
      <div className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          {currentTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <HeroSection
                onScanClick={scrollToScanner}
                onOpenStudio={() => handleTabChange("studio")}
                onFileSelected={(file) => {
                  setInitialScanFile(file);
                  scrollToScanner();
                }}
              />

              {/* Social Proof & Hiring Marquee */}
              <SocialProofMarquee />

              {/* Bento Features Grid */}
              <FeaturesBento />

              {/* Comparative Before vs After Audit */}
              <BeforeAfterShowcase />

              {/* Real-time Interactive ATS Scanner */}
              <AtsScannerSection 
                onOpenStudio={() => handleTabChange("studio")} 
                onResumeScanned={handleResumeUploaded}
                initialFile={initialScanFile}
              />

              {/* Transparent Pricing Matrix */}
              <PricingMatrix 
                onScanClick={scrollToScanner}
                onOpenStudio={() => handleTabChange("studio")}
                onSelectPlan={() => handleTabChange("studio")}
              />

              {/* FAQ & Executive Footer */}
              <FaqAndFooter />
            </motion.div>
          )}

          {currentTab === "studio" && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AtsStudio
                activeResumeId={activeResumeId}
                onNavigateToMatch={() => handleTabChange("matcher")}
                onNavigateToInterview={() => handleTabChange("interview")}
                onResumeUploaded={handleResumeUploaded}
              />
              <FaqAndFooter />
            </motion.div>
          )}

          {currentTab === "matcher" && (
            <motion.div
              key="matcher"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <JobMatchStudio
                activeResumeId={activeResumeId}
                initialJobTitle={prefilledJob?.title}
                initialJobDescription={prefilledJob?.description}
                onMatchComplete={(matchId) => setActiveJobMatchId(matchId)}
                onStartInterview={() => handleTabChange("interview")}
              />
              <FaqAndFooter />
            </motion.div>
          )}

          {currentTab === "scout" && (
            <motion.div
              key="scout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <JobScoutStudio
                activeResumeId={activeResumeId}
                onMatchJob={handleMatchFromScout}
                onInterviewPrep={handleInterviewFromScout}
              />
              <FaqAndFooter />
            </motion.div>
          )}

          {currentTab === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InterviewStudio
                activeResumeId={activeResumeId}
                activeJobMatchId={activeJobMatchId}
                initialRole={prefilledJob?.title}
              />
              <FaqAndFooter />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
