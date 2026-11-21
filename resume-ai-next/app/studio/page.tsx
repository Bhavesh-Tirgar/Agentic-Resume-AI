"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/sections/Navbar";
import { FaqAndFooter } from "@/components/sections/FaqAndFooter";
import { AtsStudio } from "@/components/studio/AtsStudio";
import { useRouter } from "next/navigation";
import { setActiveResumeId as saveActiveResumeId } from "@/lib/api";

export default function StudioPage() {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === "overview") router.push("/");
    else router.push(`/${tab}`);
  };

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#090a0d] text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar
        currentTab="studio"
        onTabChange={handleTabChange as any}
        onUploadClick={() => router.push("/#scanner")}
      />
      <div className="flex-1 pt-20">
        <AtsStudio
          onNavigateToMatch={() => router.push("/matcher")}
          onNavigateToInterview={() => router.push("/interview")}
          onResumeUploaded={(id) => saveActiveResumeId(id)}
        />
        <FaqAndFooter />
      </div>
    </main>
  );
}
