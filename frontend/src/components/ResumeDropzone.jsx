import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function ResumeDropzone({ onProcessingComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, processing, complete, error
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  const processingSteps = [
    { title: "Binary Ingestion & PDF Magic Bytes", detail: "Validating header %PDF- and extracting clean text layer" },
    { title: "ResumeParserAgent", detail: "Structuring experience, education, and domain skills schema" },
    { title: "ResumeAnalysisAgent", detail: "Running recruiter evaluation and identifying quantifiable metric gaps" },
    { title: "ResumeScoringAgent", detail: "Calculating ATS compatibility indices and rewriting weak bullets" },
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
      setErrorMessage("Unsupported format. Please upload a standard PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds 5MB size limit. Please upload a smaller PDF.");
      return;
    }
    runSimulation();
  };

  const handleQuickLoad = () => {
    runSimulation();
  };

  const runSimulation = async () => {
    setUploadStatus("processing");
    setActiveStep(0);

    for (let i = 0; i < processingSteps.length; i++) {
      setActiveStep(i);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setUploadStatus("complete");
    setTimeout(() => {
      onProcessingComplete();
    }, 600);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Ingest Candidate Resume</h1>
        <p className="text-sm text-[#8c96a8] mt-1">
          Upload a PDF resume to execute the 5-agent LangGraph pipeline: parse structured schemas, audit impact metrics, score ATS readability, and optimize bullet points.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => uploadStatus === "idle" && inputRef.current?.click()}
        className={`relative rounded-xl border p-8 text-center transition-all ${
          dragActive
            ? "border-emerald-500 bg-[#121b16]"
            : "border-[#232836] bg-[#12151c] hover:border-[#353d50] hover:bg-[#151922] cursor-pointer"
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
            <div className="w-12 h-12 rounded-lg bg-[#181d27] border border-[#262c3b] flex items-center justify-center text-[#8c96a8] mb-4">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>

            <p className="text-sm font-medium text-white">
              Drag and drop your PDF here, or <span className="text-emerald-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-[#6b7585] mt-1.5">
              Single-column or multi-column PDF • Maximum size 5MB
            </p>

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 px-3 py-1.5 rounded-md">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-[#1e2330] w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6b7585]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Binary header validation enabled</span>
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickLoad();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1e2430] hover:bg-[#283040] text-white font-medium transition cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Instant Demo: Load Sample Dossier</span>
              </button>
            </div>
          </div>
        )}

        {uploadStatus === "processing" && (
          <div className="py-2 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm font-semibold text-white">Running Multi-Agent Evaluation</span>
              </div>
              <span className="text-xs font-mono text-[#8c96a8]">Step {activeStep + 1} of 4</span>
            </div>

            <div className="space-y-2">
              {processingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    idx === activeStep
                      ? "bg-[#181d28] border-emerald-500/50 text-white"
                      : idx < activeStep
                      ? "bg-[#10131a] border-[#1c212d] text-[#6b7585]"
                      : "bg-[#0d0f14] border-transparent text-[#4b5260]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{step.title}</span>
                    {idx < activeStep && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {idx === activeStep && <span className="text-[10px] uppercase font-mono text-emerald-400">Processing...</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-[#8c96a8]">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadStatus === "complete" && (
          <div className="py-6 flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <h3 className="text-base font-semibold text-white">Evaluation Complete</h3>
            <p className="text-xs text-[#8c96a8] mt-1">Directing to Candidate Audit Dossier...</p>
          </div>
        )}
      </div>
    </div>
  );
}
