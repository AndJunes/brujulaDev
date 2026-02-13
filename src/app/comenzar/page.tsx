"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import BrujulaLogo from "@/components/landing/brujula-logo";
import Link from "next/link";

type Role = "employer" | "freelancer" | null;

export default function ComenzarPage() {
  const router = useRouter();
  const { address, isConnected, isConnecting, connect } = useWallet();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      // If not connected, connect wallet first
      let walletAddress: string | null | undefined = address;
      if (!isConnected || !walletAddress) {
        walletAddress = await connect();
        if (!walletAddress) {
          setIsLoading(false);
          return;
        }
      }

      // Store role in sessionStorage for the dashboard
      sessionStorage.setItem("brujula_role", selectedRole);
      sessionStorage.setItem("brujula_wallet", walletAddress);

      // Route to the correct dashboard
      if (selectedRole === "employer") {
        router.push("/dashboard/employer");
      } else {
        router.push("/dashboard/freelancer");
      }
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <BrujulaLogo size={28} />
          <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
            BRUJULA
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
              Como queres usar Brujula?
            </h1>
            <p className="text-muted-foreground text-base">
              Selecciona tu rol para personalizar tu experiencia
            </p>
          </div>

          {/* Role cards */}
          <div className="grid gap-4 mb-8">
            {/* Employer */}
            <button
              onClick={() => setSelectedRole("employer")}
              className={`relative text-left p-6 rounded-xl border-2 transition-all ${
                selectedRole === "employer"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-accent hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === "employer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground mb-1">
                    Soy Empleador
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Quiero publicar trabajos, contratar freelancers y pagar de forma segura con escrow en USDC.
                  </p>
                </div>
                {selectedRole === "employer" && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Freelancer */}
            <button
              onClick={() => setSelectedRole("freelancer")}
              className={`relative text-left p-6 rounded-xl border-2 transition-all ${
                selectedRole === "freelancer"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-accent hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === "freelancer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground mb-1">
                    Soy Freelancer
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Quiero encontrar trabajos, postularme y cobrar de forma segura e instantanea en USDC.
                  </p>
                </div>
                {selectedRole === "freelancer" && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Wallet status */}
          {isConnected && address && (
            <div className="flex items-center gap-2 justify-center mb-6 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">
                Wallet conectada:{" "}
                <span className="font-mono text-foreground">{address.slice(0, 6)}...{address.slice(-4)}</span>
              </span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading || isConnecting}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading || isConnecting
              ? "Conectando wallet..."
              : !isConnected
              ? "Conectar wallet y continuar"
              : "Continuar"}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Necesitas la extension{" "}
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Freighter
            </a>{" "}
            para conectar tu wallet Stellar
          </p>
        </div>
      </main>
    </div>
  );
}
