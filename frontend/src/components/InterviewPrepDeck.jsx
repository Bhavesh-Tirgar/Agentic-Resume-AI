import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle, BookOpen, Layers } from "lucide-react";
import { DEMO_INTERVIEW_PLAN } from "../api";

export default function InterviewPrepDeck() {
  const [questions] = useState(DEMO_INTERVIEW_PLAN);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(questions[0]?.id || null);
  const [completedMap, setCompletedMap] = useState({});

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "System Design & Multi-Agent Architecture", label: "System Design & Agents" },
    { id: "API Security & Prompt Injection", label: "Security & Injection Defense" },
    { id: "Django & Database Integrity", label: "Django & Database" },
  ];

  const filteredQuestions = selectedCategory === "all"
    ? questions
    : questions.filter((q) => q.category === selectedCategory);

  const toggleComplete = (id, e) => {
    e.stopPropagation();
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  return (
    <div className="w-full max-w-5xl mx-auto py-2 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Technical Interview Preparation Cockpit</h1>
          <p className="text-xs text-[#8c96a8] mt-1">
            Tailored architectural and behavioral questions generated from your resume. Practice responses using the structured STAR framework.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-[#8c96a8] bg-[#12151c] px-3 py-1.5 rounded-md border border-[#1f2431]">
          <span>Prepared:</span>
          <span className="text-emerald-400 font-semibold">{completedCount} / {questions.length}</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? "bg-[#1f2533] border-[#384256] text-white"
                : "bg-[#12151c] border-[#1d222e] text-[#8c96a8] hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Questions Accordion */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedId === q.id;
          const isCompleted = !!completedMap[q.id];

          return (
            <div
              key={q.id}
              className={`surface-card transition-colors ${
                isExpanded ? "border-[#2e3748]" : "border-[#1e222b]"
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => toggleComplete(q.id, e)}
                    title={isCompleted ? "Mark incomplete" : "Mark prepared"}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isCompleted
                        ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                        : "border-[#2b313f] hover:border-[#424c61] text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181d26] text-[#8c96a8] border border-[#232936]">
                        {q.category}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {q.difficulty}
                      </span>
                    </div>

                    <h3 className={`text-xs font-semibold leading-snug ${isCompleted ? "text-[#8c96a8] line-through" : "text-white"}`}>
                      {q.question}
                    </h3>
                  </div>
                </div>

                <div className="text-[#6b7585] pt-0.5 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Detailed Coaching */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-[#1b202c] space-y-4 text-xs">
                  {/* Why Asked */}
                  <div className="p-3 rounded-lg bg-[#0e1117] border border-[#1d222e]">
                    <span className="text-[10px] font-mono uppercase text-[#8c96a8] font-semibold block mb-1">
                      Interviewer Intent & Assessment Criteria:
                    </span>
                    <p className="text-[#c4ccd9] leading-relaxed">
                      {q.why_asked}
                    </p>
                  </div>

                  {/* Structured STAR Answer Breakdown */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block mb-2">
                      Structured STAR Answer Blueprint (Mapped to Candidate Experience):
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-lg bg-[#11141c] border border-[#1e2432]">
                        <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold block mb-1">
                          Situation:
                        </span>
                        <p className="text-[#8c96a8] leading-relaxed">
                          {q.star_answer.situation}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#11141c] border border-[#1e2432]">
                        <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block mb-1">
                          Task:
                        </span>
                        <p className="text-[#8c96a8] leading-relaxed">
                          {q.star_answer.task}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#11141c] border border-[#1e2432]">
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block mb-1">
                          Action & Architecture:
                        </span>
                        <p className="text-[#8c96a8] leading-relaxed">
                          {q.star_answer.action}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#11141c] border border-[#1e2432]">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block mb-1">
                          Measurable Result:
                        </span>
                        <p className="text-[#8c96a8] leading-relaxed">
                          {q.star_answer.result}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Common Trap to Avoid */}
                  <div className="p-3 rounded-lg bg-[#1a1215] border border-[#3b1b22] text-[#fca5a5]">
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold block mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Rookie Trap / Answer to Avoid:</span>
                    </span>
                    <p className="leading-relaxed">
                      {q.trap_to_avoid}
                    </p>
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
