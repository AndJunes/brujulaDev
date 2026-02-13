"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";

interface Agreement {
  id: string;
  jobTitle: string;
  jobAmount: number;
  status: string;
}

type Step = "loading" | "ready" | "confirming" | "success" | "error";

export default function ConfirmPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;

  const [wallet, setWallet] = useState<string | null>(null);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [txHash, setTxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    const storedRole = sessionStorage.getItem("brujula_role");

    if (!storedWallet || storedRole !== "freelancer") {
      router.push("/comenzar");
      return;
    }

    setWallet(storedWallet);
    fetchAgreement(storedWallet);
  }, [router, agreementId]);

  const fetchAgreement = async (address: string) => {
    try {
      const res = await fetch(`/api/agreements?freelancerAddress=${address}`);
      if (res.ok) {
        const data = await res.json();
        const found = data.agreements?.find((a: Agreement) => a.id === agreementId);
        if (found) {
          setAgreement(found);
          setStep("ready");
        } else {
          setStep("error");
          setErrorMsg("Acuerdo no encontrado");
        }
      }
    } catch {
      setStep("error");
      setErrorMsg("Error al cargar datos");
    }
  };

  const handleConfirm = async () => {
    setStep("confirming");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/agreements/${agreementId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerAddress: wallet }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al confirmar");
      }

      setTxHash(data.txHash);
      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
      setStep("error");
    }
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  if (step === "success") {
    const platformFee = agreement ? Math.round(agreement.jobAmount * 0.02 * 100) / 100 : 0;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Pago recibido</h2>
          <p className="text-3xl font-bold text-primary mb-2">
            {"$"}{agreement?.jobAmount} USDC
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Los fondos fueron transferidos a tu wallet. Fee de plataforma: {"$"}{platformFee} USDC.
          </p>

          {txHash && txHash !== "unknown" && (
            <div className="bg-muted rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Transaccion</p>
              <p className="text-xs font-mono text-foreground break-all">{txHash}</p>
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard/freelancer")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirming") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-sm mx-auto p-8 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Liberando fondos...</h3>
          <p className="text-sm text-muted-foreground">
            Procesando el pago en la red Stellar. Esto puede tomar unos segundos.
          </p>
        </div>
      </div>
    );
  }

  const platformFee = agreement ? Math.round(agreement.jobAmount * 0.02 * 100) / 100 : 0;
  const netAmount = agreement ? agreement.jobAmount : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/dashboard/freelancer" className="flex items-center gap-2">
            <BrujulaLogo size={28} />
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
              BRUJULA
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-border rounded-xl p-8 mt-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground mb-1">
              Trabajo aprobado
            </h1>
            <p className="text-sm text-muted-foreground">
              El empleador aprobo tu entrega. Confirma para recibir el pago.
            </p>
          </div>

          {agreement && (
            <>
              <div className="bg-muted/30 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-foreground mb-3">{agreement.jobTitle}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monto del trabajo</span>
                    <span className="text-foreground font-medium">{"$"}{agreement.jobAmount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee de plataforma (2%)</span>
                    <span className="text-muted-foreground">-{"$"}{platformFee} USDC</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-foreground font-medium">Recibiras</span>
                    <span className="text-foreground font-bold">{"$"}{netAmount} USDC</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {step === "error" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/freelancer"
                  className="px-6 py-3 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Confirmar y recibir pago
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
