"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FreelancerHeader from "@/components/dashboard/FreelancerHeader";
import { getProfile, Profile } from "@/lib/profile";
import { truncateAddress } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  amount: number;
  estimatedDays: number;
  status: string;
  skills: string;
  createdAt: string;
}

interface JobDetail {
  id: string;
  title: string;
  description: string;
  deliverables: string | null;
  requirements: string | null;
  amount: number;
  estimatedDays: number;
  deadline: string | null;
  status: string;
  employerAddress: string;
  category: string;
  skills: string;
  createdAt: string;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  jobAmount: number;
  status: string;
  appliedAt: string;
}

interface Agreement {
  id: string;
  jobId: string;
  jobTitle: string;
  jobAmount: number;
  status: string;
  createdAt: string;
}

type Tab = "jobs" | "applications" | "agreements";

// --- Helper functions ---

const CATEGORY_PALETTE = [
  "bg-blue-500/20 text-blue-400",
  "bg-purple-500/20 text-purple-400",
  "bg-pink-500/20 text-pink-400",
  "bg-amber-500/20 text-amber-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-cyan-500/20 text-cyan-400",
  "bg-rose-500/20 text-rose-400",
  "bg-indigo-500/20 text-indigo-400",
];

function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length];
}

function computeMatchScore(jobSkills: string[], profileSkills: string[]): number {
  if (jobSkills.length === 0) return 0;
  const profileSet = new Set(profileSkills.map((s) => s.toLowerCase().trim()));
  const matched = jobSkills.filter((s) => profileSet.has(s.toLowerCase().trim()));
  return Math.round((matched.length / jobSkills.length) * 100);
}

function isJobNew(createdAt: string): boolean {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 48 * 60 * 60 * 1000; // 48 hours
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const [wallet, setWallet] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Split-panel state
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedJobApplication, setSelectedJobApplication] = useState<Application | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    const storedRole = sessionStorage.getItem("brujula_role");

    if (!storedWallet || storedRole !== "freelancer") {
      router.push("/comenzar");
      return;
    }

    setWallet(storedWallet);
    setProfile(getProfile());
    fetchAllData(storedWallet);
  }, [router]);

  const fetchAllData = async (address: string) => {
    try {
      const [jobsRes, appsRes, agreementsRes] = await Promise.all([
        fetch("/api/jobs?status=OPEN"),
        fetch(`/api/applications?freelancerAddress=${address}`),
        fetch(`/api/agreements?freelancerAddress=${address}`),
      ]);

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        const jobList = data.jobs || [];
        setJobs(jobList);
      }

      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.applications || []);
      }

      if (agreementsRes.ok) {
        const data = await agreementsRes.json();
        setAgreements(data.agreements || []);
      }

      const userRes = await fetch(`/api/users?stellarAddress=${address}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.userId) setUserId(userData.userId);
      }
    } catch (error) {
      console.error("Error fetching freelancer dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = useCallback(async (jobId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSelectedJobId(jobId);
    setDetailLoading(true);
    setSelectedJob(null);
    setSelectedJobApplication(null);

    try {
      const fetchPromises: [Promise<Response>, Promise<Response> | null] = [
        fetch(`/api/jobs/${jobId}`, { signal: controller.signal }),
        wallet
          ? fetch(`/api/applications?jobId=${jobId}&freelancerAddress=${wallet}`, { signal: controller.signal })
          : null as unknown as Promise<Response>,
      ];

      const [jobRes, appRes] = await Promise.all(
        fetchPromises.filter((p): p is Promise<Response> => p !== null)
      );

      if (controller.signal.aborted) return;

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setSelectedJob(jobData);
      }

      if (appRes?.ok) {
        const appData = await appRes.json();
        const apps = appData.applications || [];
        setSelectedJobApplication(apps.length > 0 ? apps[0] : null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    } finally {
      if (!controller.signal.aborted) {
        setDetailLoading(false);
      }
    }
  }, [wallet]);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      handleSelectJob(jobs[0].id);
    }
  }, [jobs, selectedJobId, handleSelectJob]);

  const handleLogout = () => {
    sessionStorage.removeItem("brujula_wallet");
    sessionStorage.removeItem("brujula_role");
    router.push("/");
  };

  const getSkillsArray = (skills: string) => {
    if (!skills) return [];
    return skills.split(",").map((s: string) => s.trim()).filter(Boolean);
  };

  const getDeliverablesArray = (deliverables: string | null) => {
    if (!deliverables) return [];
    return deliverables.split(",").map((d: string) => d.trim()).filter(Boolean);
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  const getAppStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pendiente", className: "bg-yellow-500/20 text-yellow-400" },
      ACCEPTED: { label: "Aceptada", className: "bg-green-500/20 text-green-400" },
      REJECTED: { label: "Rechazada", className: "bg-red-500/20 text-red-400" },
    };
    return map[status] || { label: status, className: "bg-white/10 text-white/60" };
  };

  const getAgreementAction = (agreement: Agreement) => {
    switch (agreement.status) {
      case "ACTIVE":
        return { label: "Entregar trabajo", href: `/dashboard/freelancer/agreements/${agreement.id}/deliver` };
      case "WORK_DELIVERED":
        return { label: "Esperando revision...", href: null };
      case "EMPLOYER_APPROVED":
        return { label: "Confirmar y cobrar", href: `/dashboard/freelancer/agreements/${agreement.id}/confirm` };
      case "COMPLETED":
        return { label: "Completado", href: null };
      default:
        return { label: agreement.status, href: null };
    }
  };

  const getAgreementStatusColor = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: "bg-blue-500/20 text-blue-400",
      WORK_DELIVERED: "bg-yellow-500/20 text-yellow-400",
      EMPLOYER_APPROVED: "bg-green-500/20 text-green-400",
      COMPLETED: "bg-green-500/20 text-green-400",
      DISPUTED: "bg-red-500/20 text-red-400",
    };
    return map[status] || "bg-white/10 text-white/60";
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "jobs", label: "Trabajos disponibles", count: jobs.length },
    { id: "applications", label: "Mis postulaciones", count: applications.length },
    { id: "agreements", label: "Mis acuerdos", count: agreements.length },
  ];

  const profileSkills = profile?.skills || [];

  // Check if a job has been applied to
  const hasApplied = (jobId: string) => applications.some((a) => a.jobId === jobId);

  // Render match score indicator
  const MatchScoreCircle = ({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) => {
    const color = score >= 70 ? "text-[#7FB5E2]" : score >= 40 ? "text-[#7FB5E2]/70" : "text-red-400";
    const bgColor = score >= 70 ? "bg-[#356EA6]/20" : score >= 40 ? "bg-[#356EA6]/12" : "bg-red-500/15";
    const ringColor = score >= 70 ? "ring-[#356EA6]/30" : score >= 40 ? "ring-[#356EA6]/20" : "ring-red-500/30";
    if (size === "lg") {
      return (
        <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColor} ring-2 ${ringColor}`}>
          <span className={`text-lg font-bold ${color}`}>{score}%</span>
        </div>
      );
    }
    return (
      <div className={`flex items-center justify-center w-9 h-9 rounded-full ${bgColor} ring-1 ${ringColor} shrink-0`}>
        <span className={`text-[10px] font-bold ${color}`}>{score}%</span>
      </div>
    );
  };

  // Category initial circle
  const CategoryCircle = ({ category, size = "sm" }: { category: string; size?: "sm" | "lg" }) => {
    const colorClass = getCategoryColor(category);
    const initial = category.charAt(0).toUpperCase();
    if (size === "lg") {
      return (
        <div className={`w-11 h-11 rounded-xl ${colorClass} flex items-center justify-center text-base font-bold shrink-0`}>
          {initial}
        </div>
      );
    }
    return (
      <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center text-xs font-bold shrink-0`}>
        {initial}
      </div>
    );
  };

  return (
    <div data-theme="dark" className="min-h-screen bg-[#040b15] text-slate-100 flex flex-col">
      <FreelancerHeader />

      <main className={`${activeTab === "jobs" ? "max-w-7xl" : "max-w-6xl"} mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 transition-all flex-1 w-full`}>
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#7FB5E2] text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? "bg-[#356EA6]/25 text-[#7FB5E2]" : "bg-white/10 text-white/50"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-[#7FB5E2] border-r-transparent" />
          </div>
        ) : (
          <>
            {/* Tab: Available Jobs */}
            {activeTab === "jobs" && (
              <>
                {/* Desktop: Split-panel layout */}
                <div className="hidden lg:flex gap-6">
                  {/* Left panel: Job list */}
                  <div className="w-[40%] shrink-0">
                    <div className="border border-white/10 rounded-xl bg-[#12263a] overflow-hidden">
                      <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                        {jobs.map((job, index) => {
                          const skills = getSkillsArray(job.skills);
                          const isSelected = selectedJobId === job.id;
                          const matchScore = computeMatchScore(skills, profileSkills);
                          const jobIsNew = isJobNew(job.createdAt);
                          const applied = hasApplied(job.id);
                          return (
                            <button
                              key={job.id}
                              onClick={() => handleSelectJob(job.id)}
                              className={`w-full text-left p-4 transition-all ${
                                isSelected
                                  ? "bg-white/[0.06] border-l-2 border-l-[#7FB5E2]"
                                  : "border-l-2 border-l-transparent hover:bg-white/[0.03]"
                              } ${index > 0 ? "border-t border-white/5" : ""}`}
                            >
                              <div className="flex gap-3">
                                <CategoryCircle category={job.category || "General"} />
                                <div className="flex-1 min-w-0">
                                  {/* Badges row */}
                                  <div className="flex items-center gap-1.5 mb-1">
                                    {jobIsNew && (
                                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                        Nuevo
                                      </span>
                                    )}
                                    {applied && (
                                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                        Postulado
                                      </span>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <h3 className={`font-semibold text-sm leading-snug mb-0.5 ${
                                    isSelected ? "text-white" : "text-white/90"
                                  }`}>
                                    {job.title}
                                  </h3>

                                  {/* Category · Days */}
                                  <p className="text-xs text-white/40 mb-2">
                                    {job.category && <span className="capitalize">{job.category}</span>}
                                    {job.category && " · "}
                                    {job.estimatedDays} dias
                                  </p>

                                  {/* Salary */}
                                  <p className="text-sm font-bold text-white mb-2">
                                    {"$"}{job.amount.toLocaleString()} <span className="text-xs font-normal text-white/40">USDC</span>
                                  </p>

                                  {/* Outlined skill tags */}
                                  {skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {skills.slice(0, 3).map((skill) => (
                                        <span
                                          key={skill}
                                          className="text-[10px] border border-white/15 text-white/50 px-2 py-0.5 rounded-full"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                      {skills.length > 3 && (
                                        <span className="text-[10px] text-white/30">+{skills.length - 3}</span>
                                      )}
                                    </div>
                                  )}

                                  {/* Bottom row: time ago */}
                                  <p className="text-[10px] text-white/30">
                                    {formatTimeAgo(job.createdAt)}
                                  </p>
                                </div>

                                {/* Match score */}
                                {profileSkills.length > 0 && skills.length > 0 && (
                                  <MatchScoreCircle score={matchScore} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Job detail */}
                  <div className="w-[60%]">
                    <div className="sticky top-24 border border-white/10 rounded-xl bg-[#12263a] overflow-hidden max-h-[calc(100vh-220px)] flex flex-col">
                      {detailLoading ? (
                        <div className="flex items-center justify-center py-24">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-[#7FB5E2] border-r-transparent" />
                        </div>
                      ) : selectedJob ? (
                        <>
                          <div className="flex-1 overflow-y-auto p-6">
                            {/* Header */}
                            <div className="mb-6">
                              <div className="flex items-start gap-4 mb-3">
                                <CategoryCircle category={selectedJob.category || "General"} size="lg" />
                                <div className="flex-1 min-w-0">
                                  <h2 className="text-xl font-bold text-white leading-snug mb-1">
                                    {selectedJob.title}
                                  </h2>
                                  <div className="flex items-center gap-2 text-xs text-white/40">
                                    {selectedJob.category && (
                                      <span className="capitalize">{selectedJob.category}</span>
                                    )}
                                    {selectedJob.category && <span>·</span>}
                                    <span className="font-mono">{truncateAddress(selectedJob.employerAddress)}</span>
                                    <span>·</span>
                                    <span>{formatTimeAgo(selectedJob.createdAt)}</span>
                                  </div>
                                </div>
                                <p className="text-xl font-bold text-white shrink-0">
                                  {"$"}{selectedJob.amount.toLocaleString()} <span className="text-sm font-normal text-white/40">USDC</span>
                                </p>
                              </div>
                            </div>

                            {/* Match Score Section */}
                            {profileSkills.length > 0 && getSkillsArray(selectedJob.skills).length > 0 && (() => {
                              const jobSkills = getSkillsArray(selectedJob.skills);
                              const score = computeMatchScore(jobSkills, profileSkills);
                              const profileSet = new Set(profileSkills.map((s) => s.toLowerCase().trim()));
                              const matchedCount = jobSkills.filter((s) => profileSet.has(s.toLowerCase().trim())).length;
                              const barColor = score >= 70 ? "bg-[#7FB5E2]" : score >= 40 ? "bg-[#7FB5E2]/60" : "bg-red-400";
                              return (
                                <div className="mb-6 p-4 rounded-lg bg-white/[0.03] border border-white/5">
                                  <div className="flex items-center gap-4">
                                    <MatchScoreCircle score={score} size="lg" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-white/80 mb-1">
                                        Compatibilidad de habilidades
                                      </p>
                                      <p className="text-xs text-white/40 mb-2">
                                        {matchedCount} de {jobSkills.length} habilidades coinciden con tu perfil
                                      </p>
                                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${barColor} rounded-full transition-all`}
                                          style={{ width: `${score}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* TL;DR Deliverables */}
                            {selectedJob.deliverables && (
                              <div className="mb-6">
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
                                  Entregables
                                </h3>
                                <ul className="space-y-2">
                                  {getDeliverablesArray(selectedJob.deliverables).map((d, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                                      <svg className="w-4 h-4 text-[#7FB5E2] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                      </svg>
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Stats row */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Presupuesto</p>
                                <p className="text-sm font-bold text-white">${selectedJob.amount.toLocaleString()}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Plazo</p>
                                <p className="text-sm font-bold text-white">{selectedJob.estimatedDays} dias</p>
                              </div>
                              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Fecha limite</p>
                                <p className="text-sm font-bold text-white">
                                  {selectedJob.deadline
                                    ? new Date(selectedJob.deadline).toLocaleDateString("es", { day: "numeric", month: "short" })
                                    : "—"}
                                </p>
                              </div>
                              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Habilidades</p>
                                <p className="text-sm font-bold text-white">{getSkillsArray(selectedJob.skills).length}</p>
                              </div>
                            </div>

                            {/* Required Skills */}
                            {selectedJob.skills && getSkillsArray(selectedJob.skills).length > 0 && (
                              <div className="mb-6">
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
                                  Habilidades requeridas
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                  {getSkillsArray(selectedJob.skills).map((skill) => {
                                    const isMatch = profileSkills.some(
                                      (ps) => ps.toLowerCase().trim() === skill.toLowerCase().trim()
                                    );
                                    return (
                                      <span
                                        key={skill}
                                        className={`text-xs px-2.5 py-1 rounded-full border ${
                                          isMatch
                                            ? "border-[#7FB5E2]/40 text-[#7FB5E2] bg-[#356EA6]/15"
                                            : "border-white/15 text-white/50"
                                        }`}
                                      >
                                        {skill}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Description */}
                            <div className="mb-6">
                              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
                                Descripcion
                              </h3>
                              <p className="text-sm text-white/60 whitespace-pre-line leading-relaxed">
                                {selectedJob.description}
                              </p>
                            </div>

                            {/* Requirements */}
                            {selectedJob.requirements && (
                              <div className="mb-6">
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
                                  Requisitos
                                </h3>
                                <p className="text-sm text-white/60 whitespace-pre-line leading-relaxed">
                                  {selectedJob.requirements}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Sticky apply button at bottom */}
                          <div className="border-t border-white/10 p-4 bg-[#12263a]">
                            {selectedJobApplication ? (
                              <div className={`w-full text-center py-3 rounded-lg text-sm font-medium ${getAppStatusBadge(selectedJobApplication.status).className}`}>
                                Ya postulado — {getAppStatusBadge(selectedJobApplication.status).label}
                              </div>
                            ) : (
                              <div className="flex gap-3">
                                <Link
                                  href={`/dashboard/freelancer/jobs/${selectedJob.id}/apply`}
                                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#356EA6] hover:bg-[#7FB5E2] text-white hover:text-[#040b15] rounded-lg text-sm font-semibold transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                  </svg>
                                  Postularme
                                </Link>
                                <button className="px-4 py-3 rounded-lg border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-colors">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                          <svg className="w-12 h-12 text-white/10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          <p className="text-sm text-white/30">
                            Selecciona un trabajo para ver los detalles
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile: Card layout */}
                <div className="lg:hidden grid gap-4 md:grid-cols-2">
                  {jobs.map((job) => {
                    const skills = getSkillsArray(job.skills);
                    const matchScore = computeMatchScore(skills, profileSkills);
                    const jobIsNew = isJobNew(job.createdAt);
                    const applied = hasApplied(job.id);
                    return (
                      <div
                        key={job.id}
                        className="bg-[#12263a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
                      >
                        <div className="flex gap-3 mb-3">
                          <CategoryCircle category={job.category || "General"} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              {jobIsNew && (
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                  Nuevo
                                </span>
                              )}
                              {applied && (
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                  Postulado
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-white text-base leading-snug">
                              {job.title}
                            </h3>
                            <p className="text-xs text-white/40">
                              {job.category && <span className="capitalize">{job.category}</span>}
                              {job.category && " · "}
                              {job.estimatedDays} dias
                            </p>
                          </div>
                          {profileSkills.length > 0 && skills.length > 0 && (
                            <MatchScoreCircle score={matchScore} />
                          )}
                        </div>

                        <p className="text-sm font-bold text-white mb-3">
                          {"$"}{job.amount.toLocaleString()} <span className="text-xs font-normal text-white/40">USDC</span>
                        </p>

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="text-[10px] border border-white/15 text-white/50 px-2 py-0.5 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {skills.length > 4 && (
                              <span className="text-[10px] text-white/30">+{skills.length - 4}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <p className="text-[10px] text-white/30">
                            {formatTimeAgo(job.createdAt)}
                          </p>
                          <Link
                            href={`/dashboard/freelancer/jobs/${job.id}`}
                            className="text-sm font-medium text-[#7FB5E2] hover:text-[#7FB5E2] transition-colors"
                          >
                            Ver detalles
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Tab: My Applications */}
            {activeTab === "applications" && (
              <>
                {applications.length === 0 ? (
                  <div className="text-center py-16 bg-[#12263a] border border-white/10 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No tienes postulaciones
                    </h3>
                    <p className="text-white/40 text-sm mb-4">
                      Explora los trabajos disponibles y postulate.
                    </p>

                    {selectedJob?.skills && (
                      <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {getSkillsArray(selectedJob.skills).map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs rounded-full border border-white/15 text-white/50"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {selectedJob?.id && (
                      <Link
                        href={`/dashboard/freelancer/jobs/${selectedJob.id}`}
                        className="inline-block px-6 py-3 rounded-lg bg-[#356EA6] text-white text-sm font-medium hover:bg-[#7FB5E2] hover:text-[#040b15] transition"
                      >
                        Ver detalles completos
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => {
                      const badge = getAppStatusBadge(app.status);
                      return (
                        <div key={app.id} className="bg-[#12263a] border border-white/10 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white">
                                {app.jobTitle}
                              </h3>
                              <p className="text-sm text-white/40 mt-1">
                                {"$"}{app.jobAmount} USDC · {formatTimeAgo(app.appliedAt)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Tab: My Agreements */}
            {activeTab === "agreements" && (
              <>
                {agreements.length === 0 ? (
                  <div className="text-center py-16 bg-[#12263a] border border-white/10 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No tienes acuerdos
                    </h3>
                    <p className="text-white/40 text-sm">
                      Los acuerdos aparecen cuando un empleador acepta tu postulacion.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agreements.map((agreement) => {
                      const action = getAgreementAction(agreement);
                      return (
                        <div key={agreement.id} className="bg-[#12263a] border border-white/10 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white">
                                {agreement.jobTitle}
                              </h3>
                              <p className="text-sm text-white/40 mt-1">
                                {"$"}{agreement.jobAmount} USDC · {formatTimeAgo(agreement.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAgreementStatusColor(agreement.status)}`}>
                                {action.label}
                              </span>
                              {action.href && (
                                <Link
                                  href={action.href}
                                  className="px-4 py-2 bg-[#356EA6] text-white rounded-lg text-sm font-medium hover:bg-[#7FB5E2] hover:text-[#040b15] transition-colors"
                                >
                                  {action.label}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
