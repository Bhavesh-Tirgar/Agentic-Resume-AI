"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, Download, Trash2, AlertTriangle, X, 
  Lock, CheckCircle2, RefreshCw, Database, FileText
} from "lucide-react";
import { exportUserDataApi, deleteAccountApi } from "@/lib/api";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExportData = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const blob = await exportUserDataApi();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `careerpilot_dpdp_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatusMessage({
        type: "success",
        text: "Complete data dossier downloaded successfully under DPDP Act (Sec 12) & GDPR (Art 20)."
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to export data archive."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmInput.trim().toUpperCase() !== "DELETE") {
      setStatusMessage({
        type: "error",
        text: "Please type DELETE in capital letters to confirm account erasure."
      });
      return;
    }

    setIsDeleting(true);
    setStatusMessage(null);
    try {
      const res = await deleteAccountApi();
      setStatusMessage({
        type: "success",
        text: `Account permanently erased. ${res.shredded_physical_files} physical resume files cryptographically shredded.`
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1800);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to complete account erasure."
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-[#232733] bg-white dark:bg-[#111318] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1d222d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Data Privacy & Sovereignty
              </h2>
              <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                India DPDP Act (2023) & EU GDPR Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Explanation */}
        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
          CareerPilot guarantees candidate data sovereignty. Your parsed dossiers, ATS scores, 
          interview audio, and job match telemetry are strictly protected under client-side encryption 
          and PII scrubbing.
        </p>

        {/* Action 1: Data Portability (Export) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1f2430] bg-slate-50 dark:bg-[#151821] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Right to Data Portability
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              DPDP Sec 12
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Export a complete JSON archive containing all your uploaded resumes, extracted texts, 
            ATS score breakdowns, mock interview transcripts, and discovered jobs.
          </p>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
            <span>{isExporting ? "Compiling Archive..." : "Download Complete Dossier (.JSON)"}</span>
          </button>
        </div>

        {/* Action 2: Right to Erasure (Shredding) */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-rose-900 dark:text-rose-300">
                Right to Erasure & Shredding
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              DPDP Sec 12(3)
            </span>
          </div>
          <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
            Permanently shred all physical PDF/DOCX files from storage and cascade-delete all 
            records, dossiers, and credentials from our databases. This action is irreversible.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/30 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Erase My Account & Shred Data</span>
            </button>
          ) : (
            <div className="space-y-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
              <p className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400">
                Type "DELETE" to confirm permanent cryptographic shredding:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#1a0f12] text-rose-900 dark:text-rose-100 focus:outline-hidden"
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isDeleting ? "Shredding..." : "Confirm Shred"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
