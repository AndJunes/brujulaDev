"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";
import { truncateAddress } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  description: string;
  deliverables: string;
  requirements: string;
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
  status: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [wallet, setWallet] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    const storedRole = sessionStorage.getItem("brujula_role");

    if (!storedWallet || storedRole !== "freelancer") {
      router.push("/comenzar");
      return;
    }

    setWallet(storedWallet);
    fetchData(storedWallet);
  }, [router, jobId]);

  const fetchData = async (address: string) => {
    try {
      const [jobRes, appRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch(`/api/applications?jobId=${jobId}&freelancerAddress=${address}`),
      ]);

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData);
      }

      if (appRes.ok) {
        const appData = await appRes.json();
        if (appData.applications?.length > 0) {
          setApplication(appData.applications[0]);
        }
      }
    } catch {
      // Error loading data
    } finally {
      setLoading(false);
    }
  };

  const getDeliverablesArray = (deliverables: string) => {
    if (!deliverables) return [];
    return deliverables.split(",").map((d: string) => d.trim()).filter(Boolean);
  };

  const getSkillsArray = (skills: string) => {
    if (!skills) return [];
    return skills.split(",").map((s: string) => s.trim()).filter(Boolean);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-700" },
      ACCEPTED: { label: "Aceptada", className: "bg-green-100 text-green-700" },
      REJECTED: { label: "Rechazada", className: "bg-red-100 text-red-700" },
    };
    return map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Trabajo no encontrado</h2>
          <Link href="/dashboard/freelancer" className="text-primary hover:underline text-sm">
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  const deliverables = getDeliverablesArray(job.deliverables);
  const skills = getSkillsArray(job.skills);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard/freelancer" className="flex items-center gap-2">
            <BrujulaLogo size={28} />
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
              BRUJULA
            </span>
          </Link>
          {wallet && (
            <span className="text-sm text-muted-foreground font-mono">
              {truncateAddress(wallet)}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/freelancer"
          className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a trabajos
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 mt-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
                {job.title}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                {job.category && <span className="capitalize">{job.category}</span>}
                <span>Empleador: {truncateAddress(job.employerAddress)}</span>
              </div>
            </div>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 shrink-0">
              Abierto
            </span>
          </div>

          {/* Amount and time */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Presupuesto</p>
              <p className="text-lg font-bold text-foreground">{"$"}{job.amount} USDC</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tiempo estimado</p>
              <p className="text-lg font-bold text-foreground">{job.estimatedDays} dias</p>
            </div>
            {job.deadline && (
              <div>
                <p className="text-xs text-muted-foreground">Fecha limite</p>
                <p className="text-lg font-bold text-foreground">
                  {new Date(job.deadline).toLocaleDateString("es")}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-[family-name:var(--font-heading)] font-semibold text-foreground mb-2">
              Descripcion
            </h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div className="mb-6">
              <h2 className="font-[family-name:var(--font-heading)] font-semibold text-foreground mb-2">
                Entregables
              </h2>
              <ul className="space-y-1.5">
                {deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-6">
              <h2 className="font-[family-name:var(--font-heading)] font-semibold text-foreground mb-2">
                Requisitos
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="font-[family-name:var(--font-heading)] font-semibold text-foreground mb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="border-t border-border pt-6">
            {application ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Tu postulacion:</span>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.status).className}`}>
                  {getStatusBadge(application.status).label}
                </span>
              </div>
            ) : job.status === "OPEN" ? (
              <Link
                href={`/dashboard/freelancer/jobs/${job.id}/apply`}
                className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Postularme a este trabajo
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                Este trabajo no esta disponible para postulaciones.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
