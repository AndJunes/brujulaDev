"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";
import NotificationBell from "@/components/notifications/bell";
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

export default function FreelancerDashboard() {
  const router = useRouter();
  const [wallet, setWallet] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    const storedRole = sessionStorage.getItem("brujula_role");

    if (!storedWallet || storedRole !== "freelancer") {
      router.push("/comenzar");
      return;
    }

    setWallet(storedWallet);
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
        setJobs(data.jobs || []);
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

  const handleLogout = () => {
    sessionStorage.removeItem("brujula_wallet");
    sessionStorage.removeItem("brujula_role");
    router.push("/");
  };

  const getSkillsArray = (skills: string) => {
    if (!skills) return [];
    return skills.split(",").map((s: string) => s.trim()).filter(Boolean);
  };

  const getAppStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
      ACCEPTED: { label: "Aceptada", className: "bg-green-100 text-green-700" },
      REJECTED: { label: "Rechazada", className: "bg-red-100 text-red-700" },
    };
    return map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  };

  const getAgreementAction = (agreement: Agreement) => {
    switch (agreement.status) {
      case "ACTIVE":
        return { label: "Entregar trabajo", href: `/dashboard/freelancer/agreements/${agreement.id}/deliver` };
      case "WORK_DELIVERED":
        return { label: "Esperando revisión...", href: null };
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
      ACTIVE: "bg-blue-100 text-blue-700",
      WORK_DELIVERED: "bg-yellow-100 text-yellow-700",
      EMPLOYER_APPROVED: "bg-green-100 text-green-700",
      COMPLETED: "bg-green-100 text-green-700",
      DISPUTED: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "jobs", label: "Trabajos disponibles", count: jobs.length },
    { id: "applications", label: "Mis postulaciones", count: applications.length },
    { id: "agreements", label: "Mis acuerdos", count: agreements.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrujulaLogo size={28} />
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
              BRUJULA
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <NotificationBell userId={userId} />
            {wallet && (
              <span className="hidden sm:inline text-sm text-muted-foreground font-mono">
                {truncateAddress(wallet)}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-muted">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-3" />
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        ) : (
          <>
            {/* Jobs Tab */}
            {activeTab === "jobs" && (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground mb-2">
                      No hay trabajos disponibles
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Volvé pronto para encontrar oportunidades.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {jobs.map((job) => {
                      const skills = getSkillsArray(job.skills);
                      return (
                        <div
                          key={job.id}
                          className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-foreground text-lg leading-snug">
                              {job.title}
                            </h3>
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 shrink-0">
                              Abierto
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{job.description}</p>

                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {skills.slice(0, 4).map((skill) => (
                                <span key={skill} className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">
                                  {skill}
                                </span>
                              ))}
                              {skills.length > 4 && <span className="text-xs text-muted-foreground">+{skills.length - 4}</span>}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">{"$"}{job.amount} USDC</span>
                              <span>{job.estimatedDays} dias</span>
                              {job.category && <span className="capitalize">{job.category}</span>}
                            </div>
                            <Link href={`/dashboard/freelancer/jobs/${job.id}`} className="text-sm font-medium text-primary hover:underline">
                              Ver detalles
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === "applications" && (
              <div className="space-y-3">
                {applications.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground mb-2">
                      No tienes postulaciones
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">Explora los trabajos disponibles y postulate.</p>
                    <button onClick={() => setActiveTab("jobs")} className="text-sm font-medium text-primary hover:underline">
                      Ver trabajos disponibles
                    </button>
                  </div>
                ) : (
                  applications.map((app) => {
                    const badge = getAppStatusBadge(app.status);
                    return (
                      <div key={app.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{app.jobTitle}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {"$"}{app.jobAmount} USDC - <span className="text-xs">Postulado el {new Date(app.appliedAt).toLocaleDateString("es")}</span>
                          </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Agreements Tab */}
            {activeTab === "agreements" && (
              <div className="space-y-3">
                {agreements.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground mb-2">
                      No tienes acuerdos activos
                    </h3>
                    <p className="text-muted-foreground text-sm">Cuando un empleador acepte tu postulación, aparecerá aquí.</p>
                  </div>
                ) : (
                  agreements.map((agreement) => {
                    const action = getAgreementAction(agreement);
                    return (
                      <div key={agreement.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{agreement.jobTitle}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{"$"}{agreement.jobAmount} USDC</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getAgreementStatusColor(agreement.status)}`}>
                            {action.label}
                          </span>
                          {action.href && (
                            <Link href={action.href} className="text-sm font-medium text-primary hover:underline">
                              Ir
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}