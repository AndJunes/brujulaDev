"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import FreelancerHeader from "@/components/dashboard/FreelancerHeader";
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
      PENDING: { label: "Pendiente", className: "bg-yellow-500/20 text-yellow-400" },
      ACCEPTED: { label: "Aceptada", className: "bg-green-500/20 text-green-400" },
      REJECTED: { label: "Rechazada", className: "bg-red-500/20 text-red-400" },
    };
    return map[status] || { label: status, className: "bg-white/10 text-white/60" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040b15] flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#356EA6] border-r-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#040b15] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Trabajo no encontrado</h2>
          <Link href="/dashboard/freelancer" className="text-[#7FB5E2] hover:underline text-sm">
            Volver al dashboard
          </Link>
        </div>
      </div>
    );
  }

  const deliverables = getDeliverablesArray(job.deliverables);
  const skills = getSkillsArray(job.skills);

  return (
    <>
      <FreelancerHeader />
      <div className="min-h-screen bg-[#040b15] text-white/80 flex justify-center px-6 py-16">
        <div className="w-full max-w-4xl pt-10">

          <Link
            href="/dashboard/freelancer"
            className="text-sm text-[#7FB5E2] hover:text-white mb-6 inline-flex items-center gap-1 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a trabajos
          </Link>

          <div className="bg-[#12263a] border border-[#1a3350] rounded-2xl p-10 mt-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {job.title}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-white/40">
                  {job.category && <span className="capitalize">{job.category}</span>}
                  <span>Empleador: {truncateAddress(job.employerAddress)}</span>
                </div>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 shrink-0">
                Abierto
              </span>
            </div>

            {/* Amount and time */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 p-4 bg-[#0a1525] rounded-lg border border-[#1a3350]">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Presupuesto</p>
                <p className="text-lg font-bold text-white">{"$"}{job.amount} USDC</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">Tiempo estimado</p>
                <p className="text-lg font-bold text-white">{job.estimatedDays} dias</p>
              </div>
              {job.deadline && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Fecha limite</p>
                  <p className="text-lg font-bold text-white">
                    {new Date(job.deadline).toLocaleDateString("es")}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xs tracking-widest text-white/40 uppercase mb-3">
                Descripcion
              </h2>
              <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>

            {/* Deliverables */}
            {deliverables.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs tracking-widest text-white/40 uppercase mb-3">
                  Entregables
                </h2>
                <ul className="space-y-1.5">
                  {deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <svg className="w-4 h-4 text-[#7FB5E2] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                <h2 className="text-xs tracking-widest text-white/40 uppercase mb-3">
                  Requisitos
                </h2>
                <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs tracking-widest text-white/40 uppercase mb-3">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs border border-[#1a3350] text-[#7FB5E2] px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            <div className="border-t border-[#1a3350] pt-6">
              {application ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/40">Tu postulacion:</span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.status).className}`}>
                    {getStatusBadge(application.status).label}
                  </span>
                </div>
              ) : job.status === "OPEN" ? (
                <Link
                  href={`/dashboard/freelancer/jobs/${job.id}/apply`}
                  className="inline-flex px-6 py-3 bg-[#356EA6] hover:bg-[#7FB5E2] text-white rounded-lg font-medium transition"
                >
                  Postularme a este trabajo
                </Link>
              ) : (
                <p className="text-sm text-white/40">
                  Este trabajo no esta disponible para postulaciones.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
