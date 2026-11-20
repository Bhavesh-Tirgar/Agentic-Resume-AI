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
import { InterviewStudio } from "@/components/studio/InterviewStudio";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");

  // Check URL hash on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "studio" || hash === "matcher" || hash === "interview") {
        setCurrentTab(hash as NavTab);
      }
    }
  }, []);

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              />

              {/* Social Proof & Hiring Marquee */}
              <SocialProofMarquee />

              {/* Bento Features Grid */}
              <FeaturesBento />

              {/* Comparative Before vs After Audit */}
              <BeforeAfterShowcase />

              {/* Real-time Interactive ATS Scanner */}
              <AtsScannerSection onOpenStudio={() => handleTabChange("studio")} />

              {/* Transparent Pricing Matrix */}
              <PricingMatrix />

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
                onNavigateToMatch={() => handleTabChange("matcher")}
                onNavigateToInterview={() => handleTabChange("interview")}
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
                onStartInterview={() => handleTabChange("interview")}
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
              <InterviewStudio />
              <FaqAndFooter />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
