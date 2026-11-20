import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume AI — Executive AI Resume Builder & Real-Time ATS Scanner",
  description: "Craft resumes that beat enterprise ATS screeners & land 3x more interviews. Powered by LangGraph multi-agent architecture and MotionSites.ai luxury design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
