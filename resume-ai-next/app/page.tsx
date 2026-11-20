"use client";

import React from "react";
import { Navbar } from "@/components/sections/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { SocialProofMarquee } from "@/components/sections/SocialProofMarquee";
import { FeaturesBento } from "@/components/sections/FeaturesBento";
import { BeforeAfterShowcase } from "@/components/sections/BeforeAfterShowcase";
import { AtsScannerSection } from "@/components/sections/AtsScannerSection";
import { PricingMatrix } from "@/components/sections/PricingMatrix";
import { FaqAndFooter } from "@/components/sections/FaqAndFooter";

export default function Home() {
  const scrollToScanner = () => {
    const el = document.getElementById("scanner");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* Floating Pill Island Navigation */}
      <Navbar onUploadClick={scrollToScanner} />

      {/* Hero Section */}
      <HeroSection onScanClick={scrollToScanner} />

      {/* Social Proof & Hiring Marquee */}
      <SocialProofMarquee />

      {/* Interactive Bento Features */}
      <FeaturesBento />

      {/* Interactive Before vs After Showcase */}
      <BeforeAfterShowcase />

      {/* Real-time Interactive ATS Scanner */}
      <AtsScannerSection />

      {/* Pricing Matrix */}
      <PricingMatrix />

      {/* FAQ & High-Conversion Footer */}
      <FaqAndFooter />
    </main>
  );
}
