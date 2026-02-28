"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/utils";

interface Agreement {
  id: string;
  jobTitle: string;
  jobAmount: number;
  jobDeliverables: string;
  freelancerAddress: string;
  deliveryUrl: string;
  deliveryNote: string;
  deliveredAt: string;
  escrowContractId: string;
  status: string;
}

type Step = "ready" | "feedback" | "approving" | "signing" | "sending" | "success" | "error";

export default function ReviewDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;
  const { address, signTransaction } = useWallet();

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("ready");
  const [feedback, setFeedback] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    const storedRole = sessionStorage.getItem("brujula_role");

    if (!storedWallet || storedRole !== "employer") {
      router.push("/comenzar");
      return;
    }

    fetchAgreement(storedWallet);
  }, [router, agreementId]);

  const fetchAgreement = async (walletAddress: string) => {
    try {
      const res = await fetch(`/api/agreements?employerAddress=${walletAddress}`);
      if (res.ok) {
        const data = await res.json();
        const found = data.agreements?.find((a: Agreement) => a.id === agreementId);
        if (found) setAgreement(found);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) return;

    try {
      const res = await fetch(`/api/agreements/${agreementId}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback.trim() }),
      });

      if (res.ok) {
        router.push("/dashboard/employer");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Error al solicitar cambios");
        setStep("error");
      }
    } catch {
      setErrorMsg("Error de conexion");
      setStep("error");
    }
  };

  const handleApprove = async () => {
    if (!agreement?.escrowContractId || !address) return;

    setStep("approving");
    setErrorMsg("");

    try {
      const approveRes = await fetch("/api/escrow/approve-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: agreement.escrowContractId,
          approver: address,
        }),
      });

      const approveData = await approveRes.json();
      if (!approveRes.ok || !approveData.success) {
        throw new Error(approveData.error || "Error al preparar aprobacion");
      }

      if (approveData.alreadyApproved) {
        setStep("sending");
        const sendRes = await fetch("/api/escrow/send-approval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedXdr: null, agreementId, alreadyApproved: true }),
        });

        const sendData = await sendRes.json();
        if (!sendRes.ok || !sendData.success) {
          throw new Error(sendData.error || "Error al actualizar estado");
        }

        setStep("success");
        return;
      }

      setStep("signing");
      const signedXdr = await signTransaction(approveData.unsignedXdr, {
        networkPassphrase: "Test SDF Network ; September 2015",
      });

      if (!signedXdr) throw new Error("La firma fue cancelada");

      setStep("sending");
      const sendRes = await fetch("/api/escrow/send-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr, agreementId }),
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok || !sendData.success) {
        throw new Error(sendData.error || "Error al enviar aprobacion");
      }

      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
      setStep("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040b15] flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#356EA6] border-r-transparent" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#040b15] flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Trabajo aprobado</h2>
          <p className="text-white/50 mb-6">
            El freelancer puede confirmar para recibir el pago de {"$"}{agreement?.jobAmount} USDC.
          </p>
          <button
            onClick={() => router.push("/dashboard/employer")}
            className="px-6 py-3 bg-[#356EA6] hover:bg-[#7FB5E2] text-white rounded-lg font-medium transition cursor-pointer"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === "approving" || step === "signing" || step === "sending") {
    return (
      <div className="min-h-screen bg-[#040b15] flex items-center justify-center">
        <div className="max-w-sm mx-auto p-8 text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#356EA6] border-r-transparent mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {step === "approving" && "Preparando aprobacion..."}
            {step === "signing" && "Firmando con tu wallet..."}
            {step === "sending" && "Enviando a Stellar..."}
          </h3>
          <p className="text-sm text-white/50">
            {step === "signing" && "Revisa y aprueba en tu wallet"}
          </p>
        </div>
      </div>
    );
  }

  const deliverables = agreement?.jobDeliverables
    ? agreement.jobDeliverables.split(",").map((d: string) => d.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#040b15]">
      <header className="border-b border-[#1a3350] bg-[#040b15] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/dashboard/employer" className="flex items-center gap-2">
            <BrujulaLogo size={28} />
            <span className="text-white tracking-[0.25em] text-sm uppercase font-light">
              BRUJULA
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/employer"
          className="text-sm text-[#7FB5E2] hover:text-white mb-6 inline-flex items-center gap-1 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        {!agreement ? (
          <div className="text-center py-16">
            <p className="text-white/40">Acuerdo no encontrado</p>
          </div>
        ) : (
          <div className="bg-[#12263a] border border-[#1a3350] rounded-2xl p-8 mt-4">
            <h1 className="text-xl font-semibold tracking-tight text-white mb-1">
              Revisar entrega
            </h1>
            <p className="text-sm text-white/40 mb-8">
              {agreement.jobTitle} - {"$"}{agreement.jobAmount} USDC - Freelancer: {truncateAddress(agreement.freelancerAddress)}
            </p>

            {/* Delivery info */}
            <div className="mb-6 p-4 bg-[#0a1525] border border-[#1a3350] rounded-lg">
              <p className="text-xs font-medium text-white/40 mb-1">Link al trabajo</p>
              <a
                href={agreement.deliveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#7FB5E2] hover:text-white transition break-all"
              >
                {agreement.deliveryUrl}
              </a>
            </div>

            {agreement.deliveryNote && (
              <div className="mb-6">
                <p className="text-xs font-medium text-white/40 mb-1">Nota del freelancer</p>
                <p className="text-sm text-white/70 whitespace-pre-wrap">{agreement.deliveryNote}</p>
              </div>
            )}

            {/* Deliverables */}
            {deliverables.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-medium text-white/40 mb-2">Entregables acordados</p>
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

            {/* Error */}
            {step === "error" && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                {errorMsg}
                <button
                  onClick={() => setStep("ready")}
                  className="ml-2 font-medium hover:text-red-300 transition cursor-pointer"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Feedback form */}
            {step === "feedback" && (
              <div className="mb-6 p-4 border border-[#1a3350] rounded-lg">
                <label className="block text-sm text-white/40 uppercase tracking-wider mb-2">
                  Que necesita ser ajustado?
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-[#1a3350] rounded-lg bg-[#0a1525] text-white/80 text-sm resize-none focus:outline-none focus:border-[#7FB5E2] transition mb-3"
                  placeholder="Describe los cambios necesarios..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("ready")}
                    className="px-4 py-2 border border-[#1a3350] rounded-lg text-sm text-white/40 hover:text-white hover:border-[#7FB5E2] transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRequestChanges}
                    disabled={!feedback.trim()}
                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium hover:bg-yellow-500/30 disabled:opacity-50 transition cursor-pointer"
                  >
                    Enviar feedback
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {step === "ready" && (
              <div className="flex items-center gap-3 pt-6 border-t border-[#1a3350]">
                <button
                  onClick={() => setStep("feedback")}
                  className="px-6 py-3 border border-[#1a3350] rounded-lg text-sm font-medium text-white/40 hover:text-white hover:border-[#7FB5E2] transition cursor-pointer"
                >
                  Solicitar cambios
                </button>
                <button
                  onClick={handleApprove}
                  className="px-6 py-3 bg-[#356EA6] hover:bg-[#7FB5E2] text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Aprobar trabajo
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
