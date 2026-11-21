"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/sections/Navbar";
import { FaqAndFooter } from "@/components/sections/FaqAndFooter";
import { AtsStudio } from "@/components/studio/AtsStudio";
import { useRouter } from "next/navigation";
import { setActiveResumeId as saveActiveResumeId, getActiveResumeId } from "@/lib/api";

export default function StudioPage() {
  const router = useRouter();
  const [activeResumeId, setActiveResumeId] = useState<number>(1);

  useEffect(() => {
    setActiveResumeId(getActiveResumeId());
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === "overview") router.push("/");
    else router.push(`/${tab}`);
  };

  const handleResumeUploaded = (id: number) => {
    setActiveResumeId(id);
    saveActiveResumeId(id);
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
          activeResumeId={activeResumeId}
          onNavigateToMatch={() => router.push("/matcher")}
          onNavigateToInterview={() => router.push("/interview")}
          onResumeUploaded={handleResumeUploaded}
        />
        <FaqAndFooter />
      </div>
    </main>
  );
}
