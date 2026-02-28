"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";
import NotificationBell from "@/components/notifications/bell";
import { truncateAddress } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  category: string;
  amount: number;
  status: string;
  createdAt: string;
  escrowContractId: string | null;
}

interface Agreement {
  id: string;
  jobTitle: string;
  jobAmount: number;
  freelancerAddress: string;
  status: string;
}

export default function EmployerDashboard() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    if (!storedWallet) return;

    setWallet(storedWallet);
    fetchData(storedWallet);
  }, []);

  const fetchData = async (walletAddress: string) => {
    try {
      const [jobsRes, agreementsRes, userRes] = await Promise.all([
        fetch(`/api/jobs?employer=${walletAddress}`),
        fetch(`/api/agreements?employerAddress=${walletAddress}`),
        fetch(`/api/users?stellarAddress=${walletAddress}`)
      ]);

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs || []);
      }

      if (agreementsRes.ok) {
        const data = await agreementsRes.json();
        setAgreements(data.agreements || []);
      }

      if (userRes.ok) {
        const data = await userRes.json();
        if (data.userId) setUserId(data.userId);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("brujula_wallet");
    sessionStorage.removeItem("brujula_role");
    window.location.href = "/";
  };

  const statusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      DRAFT: { label: "Borrador", color: "bg-white/10 text-white/60" },
      OPEN: { label: "Abierto", color: "bg-blue-500/20 text-blue-400" },
      FUNDED: { label: "Fondeado", color: "bg-green-500/20 text-green-400" },
      ASSIGNED: { label: "Asignado", color: "bg-purple-500/20 text-purple-400" },
      IN_PROGRESS: { label: "En progreso", color: "bg-yellow-500/20 text-yellow-400" },
      IN_REVIEW: { label: "En revision", color: "bg-orange-500/20 text-orange-400" },
      COMPLETED: { label: "Completado", color: "bg-green-500/20 text-green-400" },
    };
    return map[status] || { label: status, color: "bg-white/10 text-white/60" };
  };

  const getJobAction = (job: Job) => {
    switch (job.status) {
      case "OPEN":
      case "FUNDED":
      case "ASSIGNED":
        return { label: "Ver postulaciones", href: `/dashboard/employer/jobs/${job.id}/applications` };
      case "IN_REVIEW": {
        const agreement = agreements.find(
          (a) => a.status === "WORK_DELIVERED" || a.status === "EMPLOYER_APPROVED"
        );
        return agreement
          ? { label: "Revisar entrega", href: `/dashboard/employer/agreements/${agreement.id}/review` }
          : { label: "Ver", href: null };
      }
      default:
        return { label: null, href: null };
    }
  };

  const getAgreementStatusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: "Activo", color: "bg-blue-500/20 text-blue-400" },
      WORK_DELIVERED: { label: "Entrega recibida", color: "bg-orange-500/20 text-orange-400" },
      EMPLOYER_APPROVED: { label: "Aprobado", color: "bg-green-500/20 text-green-400" },
      COMPLETED: { label: "Completado", color: "bg-green-500/20 text-green-400" },
    };
    return map[status] || { label: status, color: "bg-white/10 text-white/60" };
  };

  return (
    <div className="min-h-screen bg-[#040b15]">
      {/* Top bar */}
      <header className="border-b border-[#1a3350] bg-[#040b15] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrujulaLogo size={28} />
            <span className="text-white tracking-[0.25em] text-sm uppercase font-light">
              BRUJULA
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <NotificationBell userId={userId} />
            {wallet && (
              <span className="hidden sm:inline text-xs text-white/40 font-mono">
                {truncateAddress(wallet)}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-white/50 hover:text-white transition cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Panel de Empleador
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Publica trabajos y gestiona tus contratos escrow
            </p>
          </div>
          <Link
            href="/dashboard/employer/create-job"
            className="inline-flex items-center justify-center gap-2 bg-[#356EA6] hover:bg-[#7FB5E2] text-white px-6 py-3 rounded-lg text-sm font-semibold transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Publicar trabajo
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Publicados", value: jobs.length },
            { label: "Fondeados", value: jobs.filter((j) => j.status === "FUNDED").length },
            { label: "Asignados", value: jobs.filter((j) => j.status === "ASSIGNED" || j.status === "IN_REVIEW").length },
            { label: "Completados", value: jobs.filter((j) => j.status === "COMPLETED").length },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#12263a] border border-[#1a3350] rounded-xl p-4">
              <p className="text-sm text-white/40">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Jobs list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#356EA6] border-r-transparent mb-3" />
            <p className="text-white/40">Cargando...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-[#12263a] border border-[#1a3350] rounded-xl">
            <div className="w-16 h-16 bg-[#0a1525] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Todavia no publicaste trabajos
            </h3>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
              Crea tu primer trabajo, deposita USDC en escrow y encuentra al freelancer ideal.
            </p>
            <Link
              href="/dashboard/employer/create-job"
              className="inline-flex items-center gap-2 bg-[#356EA6] hover:bg-[#7FB5E2] text-white px-6 py-3 rounded-lg text-sm font-semibold transition"
            >
              Publicar mi primer trabajo
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-3">
              Tus trabajos
            </h2>
            <div className="space-y-3 mb-10">
              {jobs.map((job) => {
                const s = statusLabel(job.status);
                const action = getJobAction(job);
                return (
                  <div
                    key={job.id}
                    className="bg-[#12263a] border border-[#1a3350] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-white/40">
                        {job.category && <span className="capitalize">{job.category}</span>}
                        <span>{"$"}{job.amount} USDC</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>
                        {s.label}
                      </span>
                      {action.href && (
                        <Link
                          href={action.href}
                          className="text-sm font-medium text-[#7FB5E2] hover:text-white transition"
                        >
                          {action.label}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Agreements section */}
            {agreements.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-white mb-3">
                  Acuerdos activos
                </h2>
                <div className="space-y-3">
                  {agreements.map((agreement) => {
                    const s = getAgreementStatusLabel(agreement.status);
                    const reviewHref = agreement.status === "WORK_DELIVERED"
                      ? `/dashboard/employer/agreements/${agreement.id}/review`
                      : null;
                    return (
                      <div
                        key={agreement.id}
                        className="bg-[#12263a] border border-[#1a3350] rounded-xl p-5 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-medium text-white">{agreement.jobTitle}</h3>
                          <p className="text-sm text-white/40 mt-0.5">
                            {"$"}{agreement.jobAmount} USDC - Freelancer: {truncateAddress(agreement.freelancerAddress)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${s.color}`}>
                            {s.label}
                          </span>
                          {reviewHref && (
                            <Link
                              href={reviewHref}
                              className="text-sm font-medium text-[#7FB5E2] hover:text-white transition"
                            >
                              Revisar
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
