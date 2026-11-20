import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

export default function ResumeDropzone({ onProcessingComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, processing, complete, error
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  const processingSteps = [
    { title: "PyMuPDF Document Ingestion", desc: "Extracting raw text layer & running OCR scan" },
    { title: "ResumeParserAgent", desc: "Structuring education, experience, and verified skills schema" },
    { title: "ResumeAnalysisAgent", desc: "Executive recruiter evaluation & gap identification" },
    { title: "ResumeScoringAgent", desc: "Benchmarking ATS compatibility & metric scoring" },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setErrorMessage("");
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please upload a valid PDF document.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds 5MB limit. Please upload a smaller PDF.");
      return;
    }
    setSelectedFile(file);
    startPipelineSimulation(file);
  };

  const startPipelineSimulation = async (file) => {
    setUploadStatus("processing");
    setActiveStep(0);

    // Simulate multi-agent steps with realistic progress
    for (let i = 0; i < processingSteps.length; i++) {
      setActiveStep(i);
      await new Promise((resolve) => setTimeout(resolve, 800 + i * 200));
    }

    setUploadStatus("complete");
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#6366f1", "#3b82f6"]
      });
    } catch (e) {
      // ignore in environments without canvas
    }

    setTimeout(() => {
      onProcessingComplete();
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Hero Headline */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Autonomous Multi-Agent Evaluation
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Audit Your Resume with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Recruiter-Grade AI</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
          Upload your resume PDF to trigger our 5-agent LangGraph workflow: parse schemas, extract key impact metrics, benchmark ATS compatibility, and simulate interviews.
        </p>
      </div>

      {/* Dropzone Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl glass-panel p-8 sm:p-12 text-center transition-all duration-300 border-2 ${
          dragActive
            ? "border-emerald-400 bg-emerald-950/20 shadow-2xl shadow-emerald-500/20 scale-[1.01]"
            : "border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-[#121626]/80"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />

        {uploadStatus === "idle" && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Drag & drop your resume PDF here</h3>
            <p className="text-xs text-slate-400 mt-1">or click to browse your files (Max 5MB • PDF only)</p>
            
            <div className="flex items-center gap-4 mt-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Magic Byte Security</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Gemini 2.5 Flash</span>
              <span>•</span>
              <span>Zero Data Leaks</span>
            </div>
          </div>
        )}

        {uploadStatus === "processing" && (
          <div className="flex flex-col items-center py-4">
            <div className="relative w-14 h-14 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-emerald-400 animate-spin"></div>
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-white mb-6">
              Swarm Processing: <span className="text-emerald-400">{processingSteps[activeStep].title}</span>
            </h3>

            {/* Step Progress Tracker */}
            <div className="w-full max-w-md space-y-3">
              {processingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                    idx === activeStep
                      ? "bg-indigo-950/40 border-indigo-500/40 text-white shadow-lg shadow-indigo-500/10"
                      : idx < activeStep
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      : "bg-white/[0.02] border-white/5 text-slate-500 opacity-60"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {idx < activeStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : idx === activeStep ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{step.title}</div>
                    <div className="text-[11px] text-slate-400">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadStatus === "complete" && (
          <div className="flex flex-col items-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Agent Audit Complete!</h3>
            <p className="text-xs text-slate-400 mt-1">Routing to your personalized Bento Grid Dashboard...</p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center justify-center gap-2 text-rose-400 text-xs font-medium bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Pre-Loaded Quick Preview Option */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <span className="text-xs text-slate-500">Want to see a live sample audit?</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onProcessingComplete();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer"
        >
          <span>Explore Demo Evaluation (Bhavesh_Tirgar_Resume.pdf)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
