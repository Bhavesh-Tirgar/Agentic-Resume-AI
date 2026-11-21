"use client";

import React from "react";
import { Navbar } from "@/components/sections/Navbar";
import { FaqAndFooter } from "@/components/sections/FaqAndFooter";
import { InterviewStudio } from "@/components/studio/InterviewStudio";
import { useRouter } from "next/navigation";
import { getActiveResumeId } from "@/lib/api";

export default function InterviewPage() {
  const router = useRouter();
  const activeResumeId = getActiveResumeId();

  const handleTabChange = (tab: string) => {
    if (tab === "overview") router.push("/");
    else router.push(`/${tab}`);
  };

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#090a0d] text-slate-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      <Navbar
        currentTab="interview"
        onTabChange={handleTabChange as any}
        onUploadClick={() => router.push("/studio")}
      />
      <div className="flex-1 pt-20">
        <InterviewStudio
          activeResumeId={activeResumeId}
        />
        <FaqAndFooter />
      </div>
    </main>
  );
}
