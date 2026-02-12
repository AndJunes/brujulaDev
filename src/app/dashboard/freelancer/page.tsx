"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  amount: number;
  estimatedDays: number;
  status: string;
  skills: string[];
  createdAt: string;
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const [wallet, setWallet] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    const storedRole = sessionStorage.getItem("brujula_role");

    if (!storedWallet || storedRole !== "freelancer") {
      router.push("/comenzar");
      return;
    }

    setWallet(storedWallet);
    fetchOpenJobs();
  }, [router]);

  const fetchOpenJobs = async () => {
    try {
      const res = await fetch("/api/jobs?status=FUNDED");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch {
      // No jobs available is fine
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("brujula_wallet");
    sessionStorage.removeItem("brujula_role");
    router.push("/");
  };

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

          <div className="flex items-center gap-4">
            {wallet && (
              <span className="hidden sm:inline text-sm text-muted-foreground font-mono">
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
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

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
            Trabajos disponibles
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Estos trabajos ya tienen los fondos depositados en escrow. Tu pago esta garantizado.
          </p>
        </div>

        {/* Guaranteed badge */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Pago garantizado por escrow</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Todos los trabajos listados tienen fondos USDC bloqueados en un smart contract de Stellar.
              Cuando completes el trabajo y el empleador apruebe, cobras al instante.
            </p>
          </div>
        </div>

        {/* Jobs */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-3" />
            <p className="text-muted-foreground">Buscando trabajos...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground mb-2">
              No hay trabajos disponibles todavia
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Los empleadores estan publicando nuevos trabajos constantemente. Volve pronto para encontrar oportunidades.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-[family-name:var(--font-heading)] font-semibold text-foreground text-lg leading-snug">
                    {job.title}
                  </h3>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 shrink-0">
                    Fondeado
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {job.description}
                </p>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{job.skills.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{"$"}{job.amount} USDC</span>
                    <span>{job.estimatedDays} dias</span>
                    <span className="capitalize">{job.category}</span>
                  </div>
                  <button className="text-sm font-medium text-primary hover:underline">
                    Postularme
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
