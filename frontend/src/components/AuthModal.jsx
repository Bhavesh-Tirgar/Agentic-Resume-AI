import React, { useState } from "react";
import { X, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import { api } from "../api";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("bhavesh");
  const [email, setEmail] = useState("bhavesh@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await api.register(username, email, password);
      }
      const data = await api.login(username, password);
      onAuthSuccess({ username: data.username || username });
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-sm rounded-xl bg-[#12151c] p-6 border border-[#222736] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-[#1a1f29] text-[#8c96a8] hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <h2 className="text-base font-bold text-white tracking-tight">
            {isRegister ? "Create Developer Account" : "Authenticate Session"}
          </h2>
          <p className="text-xs text-[#8c96a8] mt-1">
            Access protected resume operations and persistence.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-md bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[#8c96a8] block mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-md bg-[#0d0f14] border border-[#202532] text-white focus:outline-none focus:border-[#3d465c] transition font-mono"
              />
              <User className="w-3.5 h-3.5 text-[#6b7585] absolute left-2.5 top-2.5" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-[#8c96a8] block mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-md bg-[#0d0f14] border border-[#202532] text-white focus:outline-none focus:border-[#3d465c] transition font-mono"
                />
                <Mail className="w-3.5 h-3.5 text-[#6b7585] absolute left-2.5 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[#8c96a8] block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-md bg-[#0d0f14] border border-[#202532] text-white focus:outline-none focus:border-[#3d465c] transition font-mono"
              />
              <Lock className="w-3.5 h-3.5 text-[#6b7585] absolute left-2.5 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-2 rounded-md bg-white text-black font-semibold text-xs hover:bg-[#e4e7eb] transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In with JWT"}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#1d222e] text-center text-xs text-[#8c96a8]">
          <span>{isRegister ? "Already have an account?" : "Need an account?"}</span>{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-white hover:underline font-medium cursor-pointer"
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
