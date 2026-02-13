"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";

export default function ApplyToJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [wallet, setWallet] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [proposedDeliveryDate, setProposedDeliveryDate] = useState("");

  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    const storedRole = sessionStorage.getItem("brujula_role");

    if (!storedWallet || storedRole !== "freelancer") {
      router.push("/comenzar");
      return;
    }

    setWallet(storedWallet);
    fetchJob();
  }, [router, jobId]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJobTitle(data.title);
      }
    } catch {
      // Error loading job
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter.trim() || !proposedDeliveryDate) {
      setError("Completa los campos requeridos");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          freelancerAddress: wallet,
          coverLetter: coverLetter.trim(),
          portfolioUrl: portfolioUrl.trim() || undefined,
          proposedDeliveryDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar postulacion");
      }

      router.push(`/dashboard/freelancer/jobs/${jobId}?applied=true`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al enviar postulacion";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard/freelancer" className="flex items-center gap-2">
            <BrujulaLogo size={28} />
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
              BRUJULA
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/dashboard/freelancer/jobs/${jobId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al trabajo
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 mt-4">
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground mb-1">
            Postularme
          </h1>
          {jobTitle && (
            <p className="text-sm text-muted-foreground mb-8">Para: {jobTitle}</p>
          )}

          {/* Cover letter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Por que eres el indicado para este trabajo? *
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Describe tu experiencia relevante, proyectos similares, y por que deberias ser seleccionado..."
            />
          </div>

          {/* Portfolio URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Portfolio o trabajos previos (opcional)
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://tu-portfolio.com"
            />
          </div>

          {/* Proposed delivery date */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              Cuando puedes entregar? *
            </label>
            <input
              type="date"
              value={proposedDeliveryDate}
              onChange={(e) => setProposedDeliveryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/freelancer/jobs/${jobId}`}
              className="px-6 py-3 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting || !coverLetter.trim() || !proposedDeliveryDate}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Enviando..." : "Enviar postulacion"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
