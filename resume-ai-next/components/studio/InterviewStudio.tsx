"use client";

import React, { useState, useEffect } from "react";
import { 
  HelpCircle, CheckCircle2, ChevronDown, ChevronUp, 
  Copy, Check, AlertTriangle, Layers, ShieldCheck, Database, RefreshCw, Server, Download
} from "lucide-react";
import { INTERVIEW_QUESTIONS } from "@/lib/demoData";
import { createInterviewPlanApi, getInterviewPlanApi, getActiveResumeId } from "@/lib/api";

interface InterviewStudioProps {
  activeResumeId?: number;
  activeJobMatchId?: number;
}

export function InterviewStudio({ activeResumeId, activeJobMatchId }: InterviewStudioProps) {
  const [questions, setQuestions] = useState(INTERVIEW_QUESTIONS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [completedMap, setCompletedMap] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "Multi-Agent & System Design", label: "System Design & Agents" },
    { id: "Security & Prompt Injection", label: "Security & Injection Defense" },
    { id: "Backend & Database Architecture", label: "Django & Database" },
  ];

  // Auto-sync plan on mount if available
  useEffect(() => {
    const targetResumeId = activeResumeId || getActiveResumeId();
    const targetMatchId = activeJobMatchId || 1;
    getInterviewPlanApi(targetResumeId, targetMatchId)
      .then((res) => {
        const rounds = res.plan_data?.rounds || [];
        const loaded: any[] = [];
        let qId = 10;
        rounds.forEach((rnd: any) => {
          (rnd.questions || []).forEach((q: any) => {
            loaded.push({
              id: qId++,
              category: q.category || "System Architecture",
              title: q.question.slice(0, 50) + "...",
              question: q.question,
              situation: "Calibrated challenge requiring structured STAR execution.",
              task: q.reason || "Architect resilient systems and deliver measurable outcomes.",
              action: "Engineered scalable solutions with typed schemas, comprehensive testing, and defensive boundaries.",
              result: "Delivered 99.9% uptime, verified schema integrity, and improved execution velocity.",
              trap: "Rookie Trap: Giving generic answers without verifiable metrics or architectural rationale."
            });
          });
        });
        if (loaded.length > 0) {
          setQuestions([...loaded, ...INTERVIEW_QUESTIONS]);
          setApiNotice(`Live Interview Deck Loaded: Active plan synced from Django Backend.`);
        }
      })
      .catch(() => {});
  }, [activeResumeId, activeJobMatchId]);

  const handleExportQuestions = () => {
    const textData = questions.map((q, idx) => 
      `### Question ${idx + 1} (${q.category})\n**${q.question}**\n\n- **Situation:** ${q.situation}\n- **Task:** ${q.task}\n- **Action:** ${q.action}\n- **Result:** ${q.result}\n- **Trap to Avoid:** ${q.trap}\n`
    ).join("\n---\n\n");
    const blob = new Blob([textData], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Interview_Preparation_Deck.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateLivePlan = async () => {
    setIsGenerating(true);
    setApiNotice(null);
    try {
      const targetResumeId = activeResumeId || getActiveResumeId();
      const targetMatchId = activeJobMatchId || 1;
      const res = await createInterviewPlanApi(targetResumeId, targetMatchId);
      const rounds = res.plan_data?.rounds || [];
      const generatedQuestions: any[] = [];
      let qId = 10;

      rounds.forEach((rnd: any) => {
        (rnd.questions || []).forEach((q: any) => {
          generatedQuestions.push({
            id: qId++,
            category: q.category || "System Architecture",
            title: q.question.slice(0, 50) + "...",
            question: q.question,
            situation: "Production incident / scale challenge requiring deterministic architecture.",
            task: q.reason || "Architect resilient services under load.",
            action: "Executed phased migration with stateless JWT, DRF rate limits, and LangGraph multi-agent cyclical validation.",
            result: "Maintained 99.99% availability and neutralized 100% of adversarial injection payloads.",
            trap: "Rookie Trap: Omitting circuit breakers or relying on untyped prompting without Pydantic validation."
          });
        });
      });

      if (generatedQuestions.length > 0) {
        setQuestions([...generatedQuestions, ...INTERVIEW_QUESTIONS]);
        setApiNotice(`Live API Success: Generated ${generatedQuestions.length} tailored interview questions from Django Backend (Plan ID #${res.interview_plan_id})`);
      }
    } catch (err: any) {
      console.warn("API interview plan fallback:", err);
      setApiNotice(`Using calibrated question bank: ${err.message || "Local bank"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = selectedCategory === "all"
    ? questions
    : questions.filter((q) => q.category === selectedCategory || selectedCategory === "all");

  const toggleComplete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyAnswer = (q: typeof INTERVIEW_QUESTIONS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Question: ${q.question}\n\nSituation: ${q.situation}\nTask: ${q.task}\nAction: ${q.action}\nResult: ${q.result}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Technical Interview Cockpit
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#191d27] border border-slate-200 dark:border-[#272d3b] text-slate-600 dark:text-zinc-300 flex items-center gap-1">
              <Server className="w-3 h-3 text-emerald-500" />
              <span>Django API :8000</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            STAR Framework Practice Questions
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Architectural and behavioral interview scenarios calibrated to your resume. Practice responses with verified engineering impact.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleGenerateLivePlan}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Sync with Backend</span>
          </button>

          <button
            onClick={handleExportQuestions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272d3b] bg-white dark:bg-[#111318] text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#191d27] transition cursor-pointer"
            title="Download questions as Markdown"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Export Deck</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#20242e] px-3 py-1.5 rounded-lg shadow-xs">
            <span className="text-slate-500 dark:text-zinc-400">Prepared:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{completedCount} / {questions.length}</span>
          </div>
        </div>
      </div>

      {apiNotice && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{apiNotice}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-sm"
                : "bg-white dark:bg-[#111318] text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-[#20242e] hover:border-slate-300 dark:hover:border-zinc-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Question Accordion List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;
          const isDone = !!completedMap[q.id];

          return (
            <div
              key={q.id}
              className={`rounded-xl border transition-all shadow-sm ${
                isExpanded
                  ? "border-slate-400 dark:border-zinc-700 bg-white dark:bg-[#111318]"
                  : "border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] hover:border-slate-300 dark:hover:border-zinc-700"
              }`}
            >
              {/* Card Header Trigger */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => toggleComplete(q.id, e)}
                    className="mt-0.5 text-slate-300 dark:text-zinc-600 hover:text-emerald-500 transition cursor-pointer"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-zinc-700 hover:border-emerald-500" />
                    )}
                  </button>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                      {q.category}
                    </span>
                    <h3 className={`text-sm font-semibold transition-colors ${
                      isDone 
                        ? "line-through text-slate-400 dark:text-zinc-500" 
                        : "text-slate-900 dark:text-white"
                    }`}>
                      {q.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleCopyAnswer(q, e)}
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-1"
                    title="Copy full STAR answer"
                  >
                    {copiedId === q.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 space-y-4 border-t border-slate-100 dark:border-[#1a1e29] mt-2">
                  <div className="pt-3">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mb-3 bg-slate-50 dark:bg-[#0c0e14] p-3 rounded-lg border border-slate-100 dark:border-[#1d222f]">
                      🎯 Interviewer Prompt: "{q.question}"
                    </p>
                  </div>

                  {/* STAR Structure Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-100 dark:border-[#1a1f2b] space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-zinc-400">
                        Situation (Context)
                      </span>
                      <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">{q.situation}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-100 dark:border-[#1a1f2b] space-y-1">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-zinc-400">
                        Task (Engineering Goal)
                      </span>
                      <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">{q.task}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-100 dark:border-[#1a1f2b] space-y-1 sm:col-span-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                        Action (Technical Execution)
                      </span>
                      <p className="text-slate-900 dark:text-zinc-100 font-medium leading-relaxed">{q.action}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-100 dark:border-[#1a1f2b] space-y-1 sm:col-span-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-zinc-400">
                        Result (Measurable Outcome)
                      </span>
                      <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">{q.result}</p>
                    </div>
                  </div>

                  {/* Rookie Trap Alert */}
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <span>{q.trap}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
