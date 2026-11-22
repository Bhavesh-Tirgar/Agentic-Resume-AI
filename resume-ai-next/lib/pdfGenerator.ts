import { jsPDF } from "jspdf";

export type TemplateType = "harvard" | "modern";

export interface ResumePdfData {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    role: string;
    organization: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    technologies?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    grade?: string;
  }>;
  certifications?: Array<{
    name: string;
    organization?: string;
    issue_date?: string;
  }>;
}

export function generateResumePdf(data: ResumePdfData, template: TemplateType = "harvard"): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 45;

  const isHarvard = template === "harvard";
  const primaryFont = isHarvard ? "times" : "helvetica";

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }
  };

  const drawSectionHeader = (title: string) => {
    checkPageBreak(30);
    currentY += 12;
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(title.toUpperCase(), margin, currentY);

    currentY += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.75);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
  };

  // --- HEADER ---
  doc.setFont(primaryFont, "bold");
  doc.setFontSize(isHarvard ? 20 : 18);
  doc.setTextColor(15, 23, 42);

  const candidateName = (data.name || "Candidate Name").toUpperCase();
  doc.text(candidateName, pageWidth / 2, currentY, { align: "center" });
  currentY += 16;

  // Contact line
  const contactParts = [
    data.email,
    data.phone,
    data.location,
    data.headline,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.setFont(primaryFont, "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(contactParts.join("  •  "), pageWidth / 2, currentY, { align: "center" });
    currentY += 10;
  }

  // --- PROFESSIONAL SUMMARY ---
  if (data.summary && data.summary.trim()) {
    drawSectionHeader("Professional Summary");
    doc.setFont(primaryFont, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    const summaryLines = doc.splitTextToSize(data.summary.trim(), contentWidth);
    checkPageBreak(summaryLines.length * 13);
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * 13;
  }

  // --- EXPERIENCE ---
  if (data.experience && data.experience.length > 0) {
    drawSectionHeader("Experience & Professional Background");

    data.experience.forEach((exp) => {
      checkPageBreak(35);

      // Title & Date row
      doc.setFont(primaryFont, "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(exp.role || "Role Designation", margin, currentY);

      const dateStr = [exp.start_date, exp.end_date || "Present"].filter(Boolean).join(" - ");
      if (dateStr) {
        doc.setFont(primaryFont, "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(dateStr, pageWidth - margin, currentY, { align: "right" });
      }
      currentY += 13;

      // Organization & Location
      doc.setFont(primaryFont, isHarvard ? "italic" : "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const orgLine = [exp.organization, exp.location].filter(Boolean).join(", ");
      doc.text(orgLine, margin, currentY);
      currentY += 13;

      // Bullets / Description
      if (exp.description) {
        const bullets = exp.description
          .split("\n")
          .map((b) => b.trim())
          .filter((b) => b.length > 0);

        bullets.forEach((bullet) => {
          const cleanBullet = bullet.replace(/^[•\-\*]\s*/, "");
          const bulletLines = doc.splitTextToSize(cleanBullet, contentWidth - 12);
          checkPageBreak(bulletLines.length * 12 + 4);

          doc.setFont(primaryFont, "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);

          // Draw bullet dot
          doc.circle(margin + 3, currentY - 3, 1.2, "F");
          doc.text(bulletLines, margin + 12, currentY);
          currentY += bulletLines.length * 12 + 3;
        });
      }

      currentY += 6;
    });
  }

  // --- EDUCATION ---
  if (data.education && data.education.length > 0) {
    drawSectionHeader("Education");

    data.education.forEach((edu) => {
      checkPageBreak(25);

      doc.setFont(primaryFont, "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.degree || "Degree", margin, currentY);

      const eduDates = [edu.start_date, edu.end_date].filter(Boolean).join(" - ");
      if (eduDates) {
        doc.setFont(primaryFont, "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(eduDates, pageWidth - margin, currentY, { align: "right" });
      }
      currentY += 13;

      doc.setFont(primaryFont, isHarvard ? "italic" : "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const eduDetail = [edu.institution, edu.location, edu.grade].filter(Boolean).join(" • ");
      doc.text(eduDetail, margin, currentY);
      currentY += 16;
    });
  }

  // --- SKILLS ---
  if (data.skills && data.skills.length > 0) {
    drawSectionHeader("Skills & Competencies");
    checkPageBreak(25);

    doc.setFont(primaryFont, "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const skillsText = data.skills.join("  •  ");
    const skillLines = doc.splitTextToSize(skillsText, contentWidth);
    doc.text(skillLines, margin, currentY);
    currentY += skillLines.length * 12 + 8;
  }

  // --- CERTIFICATIONS ---
  if (data.certifications && data.certifications.length > 0) {
    drawSectionHeader("Certifications & Credentials");

    data.certifications.forEach((cert) => {
      checkPageBreak(18);
      doc.setFont(primaryFont, "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cert.name, margin, currentY);

      const certDetail = [cert.organization, cert.issue_date].filter(Boolean).join(" • ");
      if (certDetail) {
        doc.setFont(primaryFont, "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(certDetail, pageWidth - margin, currentY, { align: "right" });
      }
      currentY += 14;
    });
  }

  // Sanitize filename
  const safeName = (data.name || "Candidate")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeName}_ATS_Resume.pdf`;

  doc.save(filename);
}
