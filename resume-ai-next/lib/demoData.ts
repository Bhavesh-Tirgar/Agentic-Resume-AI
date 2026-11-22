export interface CategoryScore {
  name: string;
  score: number;
  status: "Optimal" | "Good" | "Exceptional" | "Needs Review";
  feedback: string;
}

export interface BulletRewrite {
  original: string;
  rewritten: string;
  reason: string;
}

export interface CandidateDossier {
  name: string;
  title: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    devops: string[];
    all_extracted?: string[];
  };
  detected_languages?: string[];
  experience: {
    role: string;
    organization: string;
    location: string;
    duration: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
    grade: string;
  }[];
}

export interface AtsResultData {
  resume_id: number;
  status: string;
  score_data: {
    overall_score: number;
    grade: string;
    percentile: string;
    summary: string;
    categories: CategoryScore[];
  };
  analysis_data: {
    strengths: string[];
    weaknesses: string[];
    bullet_rewrites: BulletRewrite[];
    improvements: string[];
  };
  parsed_data: CandidateDossier;
}

export const INITIAL_DOSSIER: AtsResultData = {
  resume_id: 101,
  status: "Completed",
  score_data: {
    overall_score: 93,
    grade: "Tier-1 Exceptional",
    percentile: "Top 4% of Industry Candidates",
    summary: "Audited across core competencies with verified single-column ATS compatibility, high action-verb density, and quantifiable business outcomes.",
    categories: [
      {
        name: "ATS Machine Readability",
        score: 96,
        status: "Optimal",
        feedback: "Clean single-column layout, standard section headings, and fully parseable contact metadata."
      },
      {
        name: "Core Competency Depth",
        score: 92,
        status: "Exceptional",
        feedback: "Dense keyword alignment across strategic delivery, functional tools, and domain leadership."
      },
      {
        name: "Quantifiable Impact & Scope",
        score: 90,
        status: "Good",
        feedback: "Strong metric density including percentage gains, cost savings, and operational velocity benchmarks."
      },
      {
        name: "Typographic & Sectional Hierarchy",
        score: 94,
        status: "Optimal",
        feedback: "Zero distorted glyphs, invalid nested tables, or unreadable graphical elements."
      }
    ]
  },
  analysis_data: {
    strengths: [
      "Standard single-column flow with verified linear heading hierarchy complying with Workday and Lever ATS screeners.",
      "Consistently leads experience bullets with high-impact action verbs (Directed, Spearheaded, Architected, Optimized).",
      "Quantifiable metrics embedded in 80%+ of bullets, proving tangible business and revenue ROI.",
      "Clear contact section with standardized location, professional email, and portfolio links."
    ],
    weaknesses: [
      "Ensure all recent certifications and domain methodologies are referenced directly in your work bullets.",
      "Include explicit team size, cross-functional partner scope, or budget governance where applicable."
    ],
    bullet_rewrites: [
      {
        original: "Responsible for managing daily team deliverables and client project updates.",
        rewritten: "Directed cross-functional execution across 18 enterprise deliverables, cutting turnaround by 42% while sustaining 99.4% SLA adherence.",
        reason: "Replaces passive task phrasing with an active executive verb, explicit project volume, turnaround reduction, and SLA performance."
      },
      {
        original: "Handled accounting entries, financial reporting, and helped with annual audit checks.",
        rewritten: "Spearheaded quarterly financial reconciliation across $42M in multi-entity assets with zero variance, optimizing recurring operating expenses by 18%.",
        reason: "Defines asset scale, eliminates passive duty list, and documents verifiable bottom-line P&L cost savings."
      },
      {
        original: "Managed business development pipelines, met leads, and closed quarterly deals.",
        rewritten: "Generated $3.4M in net new ARR across 28 enterprise client accounts, exceeding annual target quota by 142% and shrinking sales cycle from 90 to 52 days.",
        reason: "Adds concrete revenue expansion metrics, quota achievement percentage, and sales velocity improvement."
      }
    ],
    improvements: [
      "Quantify each past role with exact throughput, revenue, efficiency, or team scale benchmarks.",
      "Ensure all listed certifications and methodologies are reflected directly in the experience bullets."
    ]
  },
  parsed_data: {
    name: "Sample Candidate (Preview)",
    title: "Senior Solutions & Operations Specialist",
    location: "San Francisco, CA (or Remote)",
    email: "candidate@example.com",
    linkedin: "linkedin.com/in/sample-profile",
    github: "github.com/sample-profile",
    skills: {
      languages: ["Strategic Planning", "Cross-Functional Leadership", "Process Optimization", "Client Management"],
      frameworks: ["Enterprise Operations", "Agile & Scrum Delivery", "Vendor Governance", "Data Analytics"],
      databases: ["SQL & Relational Models", "ERP Systems", "Salesforce CRM", "Tableau / BI"],
      devops: ["Workflow Automation", "Jira / Linear", "Compliance & SLA Auditing", "Risk Governance"]
    },
    detected_languages: ["English", "Global Script Supported"],
    experience: [
      {
        role: "Senior Solutions & Delivery Specialist",
        organization: "Sample Enterprise Solutions",
        location: "New York, NY",
        duration: "2022 — Present",
        bullets: [
          "Directed cross-functional execution across 18 enterprise client accounts, reducing average delivery turnaround from 14 days to 4.2 days.",
          "Authored standard operating procedures adopted by 45+ team members, achieving 99.4% SLA adherence and zero critical compliance defects.",
          "Optimized resource allocation and vendor workflows, saving $380,000 in annual recurring operational overhead."
        ]
      },
      {
        role: "Operations & Client Systems Analyst",
        organization: "Meridian Enterprise Partners",
        location: "Remote",
        duration: "2020 — 2022",
        bullets: [
          "Conducted quarterly performance and compliance audits covering $12M in client portfolio value with 100% audit accuracy.",
          "Automated weekly reporting pipelines using SQL and BI dashboards, reducing manual spreadsheet tracking by 16 hours per week."
        ]
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Business Administration & Information Systems",
        institution: "State University",
        year: "2016 — 2020",
        grade: "First Class with Distinction"
      }
    ]
  }
};

export const JOB_ROLES_PRESETS = [
  {
    id: "solutions-lead",
    title: "Senior Solutions & Operations Specialist",
    company: "Apex Global Systems",
    category: "Operations & Strategy",
    description: `We are looking for an experienced Solutions & Operations Specialist to lead cross-functional delivery, optimize operational workflows, and govern client SLAs.
Requirements:
- 4+ years leading operations, business solutions, or enterprise delivery.
- Proven track record optimizing team workflows and reducing turnaround times.
- Strong proficiency in SQL, BI reporting dashboards, and process automation.
- Demonstrated success managing enterprise stakeholder expectations and risk governance.
- Exceptional analytical and presentation skills for executive leadership.`
  },
  {
    id: "sales-executive",
    title: "Senior Enterprise B2B Account Executive",
    company: "Global Commerce Group",
    category: "Sales & Business",
    description: `Seeking an experienced Enterprise Account Executive to manage high-yield corporate sales cycles and accelerate revenue.
Requirements:
- 4+ years in B2B corporate sales, key account management, or commercial software sales.
- Proven track record of consistently exceeding quarterly quotas (>115% attainment).
- Expertise in Salesforce CRM, pipeline forecasting, contract negotiation, and stakeholder presentations.
- Experience managing multi-decision-maker sales cycles with average deal size >$150,000.`
  },
  {
    id: "financial-analyst",
    title: "Senior Financial Analyst & Corporate Controller",
    company: "Horizon Advisory Partners",
    category: "Finance & Accounting",
    description: `Looking for a Senior Financial Analyst to lead corporate financial modeling, statutory audit compliance, and budget variance.
Requirements:
- 4+ years in corporate finance, auditing, FP&A, or commercial advisory.
- Strong mastery of Financial Modeling, GAAP/IFRS standards, Balance Sheet reconciliations, and P&L reporting.
- Advanced proficiency in Excel (financial modeling), ERP systems, and business intelligence.
- Exceptional analytical rigor delivering board-level capital allocation decks.`
  },
  {
    id: "growth-marketing",
    title: "Growth Marketing & Customer Acquisition Director",
    company: "Nexus Media Group",
    category: "Marketing & Growth",
    description: `Seeking an analytical Growth Marketer to drive omni-channel acquisition and scale paid/organic customer funnels.
Requirements:
- 4+ years managing multi-channel digital campaigns across Google, Paid Social, and SEO.
- Deep expertise in Conversion Rate Optimization (CRO), Analytics, and attribution modeling.
- Demonstrated success scaling customer acquisition with declining Customer Acquisition Cost (CAC) and high ROAS.
- Strong copywriting and creative A/B testing methodology.`
  },
  {
    id: "tech-lead",
    title: "Senior Cloud & Platform Systems Specialist",
    company: "Distributed Tech Solutions",
    category: "Technology",
    description: `We are seeking a Senior Systems Specialist to build resilient backend services, optimize data pipelines, and improve API reliability.
Requirements:
- 4+ years experience with backend systems (Python, TypeScript, or Go).
- Strong understanding of database optimization (PostgreSQL, Redis, indexing).
- Deep commitment to security, API performance, and continuous integration.
- Experience with containerization (Docker) and cloud deployments.`
  }
];

export const DEMO_JOB_MATCH_RESULT = {
  overall_match_score: 92,
  skill_match_score: 95,
  experience_match_score: 89,
  education_match_score: 94,
  matched_skills: [
    "Cross-Functional Project Delivery",
    "Operational Process Optimization",
    "Enterprise Client Management",
    "SLA & Compliance Auditing",
    "Data Analysis & BI Reporting",
    "Strategic Resource Planning",
    "Stakeholder Communication"
  ],
  missing_skills: [
    "Enterprise Risk Modeling (ERM)",
    "Six Sigma / Lean Certification",
    "Global Multi-Region Compliance"
  ],
  recommendations: [
    "Highlight specific cost-reduction percentages in your most recent experience section to showcase bottom-line impact.",
    "Add a bullet point specifying cross-functional collaboration with international partners.",
    "Explicitly mention familiarity with operational risk mitigation frameworks in your summary."
  ]
};

export const INTERVIEW_QUESTIONS = [
  {
    id: 1,
    category: "Leadership & Execution",
    title: "Leading High-Impact Cross-Functional Initiatives",
    question: "Tell me about a time you led a complex project across multiple stakeholder teams under a strict deadline. How did you ensure on-time delivery?",
    situation: "Our organization needed to roll out a revised operational standard across 18 enterprise accounts within 6 weeks to comply with new SLA mandates.",
    task: "Align multiple functional leads, identify process bottlenecks, and guarantee complete delivery without causing downtime.",
    action: "Established transparent weekly milestone sprints, automated task tracking in BI dashboards, and instituted daily 15-minute blocker triage meetings.",
    result: "Delivered 100% of accounts ahead of schedule, reducing cycle turnaround from 14 to 4.2 days with zero compliance violations.",
    trap: "Rookie Trap: Focusing only on task lists rather than cross-functional conflict resolution, communication cadences, and measurable business outcomes."
  },
  {
    id: 2,
    category: "Stakeholder Management",
    title: "Navigating Pushback and Conflicting Priorities",
    question: "Describe a scenario where key clients or executive stakeholders disagreed with your proposed roadmap. How did you resolve the impasse?",
    situation: "An enterprise client requested custom workflow exceptions that would have violated operational SLAs and increased recurring costs by 30%.",
    task: "De-escalate the tension, protect contractual compliance, and preserve client relationship satisfaction.",
    action: "Presented a data-driven impact analysis contrasting the requested exception against automated standard alternatives, demonstrating how the standard saved them $45,000 annually.",
    result: "The client unanimously adopted the standard process, renewed their annual contract with a 22% expansion, and praised our transparency.",
    trap: "Rookie Trap: Being defensive or unilaterally giving in without negotiating data-backed mutual value."
  },
  {
    id: 3,
    category: "Process Optimization",
    title: "Eliminating Waste & Demonstrating Quantifiable ROI",
    question: "Walk through an operational bottleneck you personally identified and fixed. What metrics prove it succeeded?",
    situation: "Our team was spending 16+ manual hours per week reconciling client activity across fragmented spreadsheets with frequent data discrepancies.",
    task: "Design an automated reporting pipeline that eliminates manual input and ensures real-time accuracy.",
    action: "Engineered an automated SQL data aggregation workflow integrated with live executive BI dashboards, creating one single source of truth.",
    result: "Saved 16 hours of manual overhead weekly, eliminated audit discrepancies entirely, and accelerated weekly reporting from 2 days to 5 minutes.",
    trap: "Rookie Trap: Explaining the technical tools used without stating the hours saved, error reduction, or business efficiency gained."
  },
  {
    id: 4,
    category: "Crisis & Failure Recovery",
    title: "Pivoting When a Strategic Initiative Fails",
    question: "Tell me about a time an initiative did not go as planned. How did you handle the setback?",
    situation: "A vendor integration rolled out with unexpected data latency, causing delayed client reports during a critical quarter-end cycle.",
    task: "Contain client impact, triage the technical root cause, and establish long-term safeguards.",
    action: "Immediately deployed our verified fallback reporting protocols to deliver on-time data, established an hourly client status dashboard, and renegotiated vendor SLA warranties.",
    result: "Met 100% of external client deadlines with zero SLA penalties and recovered $18,000 in vendor credits for downtime.",
    trap: "Rookie Trap: Blaming external vendors rather than demonstrating personal accountability, contingency planning, and root-cause prevention."
  }
];

export interface DiscoveredJobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  work_type: string;
  distance_commute: string;
  match_percentage: number;
  salary_range: string;
  experience_required: string;
  matched_skills: string[];
  missing_skills: string[];
  description_snippet: string;
  apply_url: string;
  match_rationale: string;
}

export interface JobDiscoveryData {
  candidate_location: string;
  total_jobs_found: number;
  jobs: DiscoveredJobItem[];
  search_summary: string;
}

export const DEMO_DISCOVERED_JOBS: JobDiscoveryData = {
  candidate_location: "Remote / Nationwide",
  total_jobs_found: 4,
  search_summary: "Found 4 proximity and skill-matched opportunities across verified enterprise employers with >85% domain compatibility.",
  jobs: [
    {
      id: "job-1",
      title: "Senior Solutions & Delivery Consultant",
      company: "Salesforce Inc.",
      location: "San Francisco, CA / Hybrid",
      work_type: "Hybrid",
      distance_commute: "Central Business District / 6 km",
      match_percentage: 95,
      salary_range: "$140,000 — $175,000 / yr",
      experience_required: "4+ years",
      matched_skills: ["Cross-Functional Delivery", "Process Optimization", "Client Management", "Enterprise SLAs", "Data Analysis"],
      missing_skills: ["Salesforce Certified Administrator", "CPQ Architecture"],
      description_snippet: "Lead enterprise client delivery, optimize multi-team operational execution, and partner with executive accounts to drive platform adoption.",
      apply_url: "https://www.google.com/search?q=Senior+Solutions+Delivery+Consultant+Salesforce+jobs",
      match_rationale: "Direct alignment with your enterprise client management history, turnaround reduction achievements, and SLA governance."
    },
    {
      id: "job-2",
      title: "Operations Strategy & Program Lead",
      company: "Stripe",
      location: "New York, NY / Remote",
      work_type: "Remote / Hybrid",
      distance_commute: "Downtown Hub / 8 km (or 100% Remote)",
      match_percentage: 92,
      salary_range: "$150,000 — $185,000 / yr",
      experience_required: "4-7 years",
      matched_skills: ["Operations Management", "Process Automation", "SQL & BI", "Strategic Planning", "Vendor Governance"],
      missing_skills: ["Global Fintech Compliance", "Payments Infrastructure"],
      description_snippet: "Scale global operational workflows, eliminate execution bottlenecks, and drive cross-functional alignment across product and finance teams.",
      apply_url: "https://www.google.com/search?q=Operations+Strategy+Program+Lead+Stripe+jobs",
      match_rationale: "Directly rewards your proven experience cutting manual spreadsheet hours, automating reporting pipelines, and managing enterprise assets."
    },
    {
      id: "job-3",
      title: "Enterprise Solutions & Client Operations Manager",
      company: "Snowflake Computing",
      location: "Remote / Nationwide",
      work_type: "100% Remote",
      distance_commute: "100% Remote (Nationwide)",
      match_percentage: 89,
      salary_range: "$135,000 — $165,000 / yr",
      experience_required: "3+ years",
      matched_skills: ["Client Solutions", "Data Analytics", "Cross-Functional Leadership", "SLA Adherence"],
      missing_skills: ["Cloud Data Warehouse Architecture", "SnowPro Certification"],
      description_snippet: "Work directly with top-tier enterprise accounts to streamline delivery cycles, audit operational compliance, and accelerate time-to-value.",
      apply_url: "https://www.google.com/search?q=Enterprise+Solutions+Client+Operations+Manager+Snowflake+jobs",
      match_rationale: "Bridges your analytical data rigor with proven enterprise client onboarding and SLA compliance excellence."
    },
    {
      id: "job-4",
      title: "Director of Operational Excellence",
      company: "Shopify Global",
      location: "Remote Worldwide",
      work_type: "Remote",
      distance_commute: "Global Remote",
      match_percentage: 87,
      salary_range: "$145,000 — $180,000 / yr",
      experience_required: "5+ years",
      matched_skills: ["Strategic Planning", "Workflow Optimization", "Vendor Management", "Cost Governance"],
      missing_skills: ["Omni-Channel Commerce Operations", "Lean Six Sigma Black Belt"],
      description_snippet: "Drive operational transformation, standardize documentation across multi-disciplinary teams, and optimize operating cost structures.",
      apply_url: "https://www.google.com/search?q=Director+Operational+Excellence+Shopify+jobs",
      match_rationale: "Direct match for your $380,000 operational cost optimization and multi-team standard operating procedure governance."
    }
  ]
};
