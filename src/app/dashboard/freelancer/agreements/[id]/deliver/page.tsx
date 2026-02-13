"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";

interface Agreement {
  id: string;
  jobTitle: string;
  jobAmount: number;
  jobDeliverables: string;
  status: string;
}

export default function DeliverWorkPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;

  const [wallet, setWallet] = useState<string | null>(null);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

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
        if (found) setAgreement(found);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const getDeliverablesArray = () => {
    if (!agreement?.jobDeliverables) return [];
    return agreement.jobDeliverables.split(",").map((d: string) => d.trim()).filter(Boolean);
  };

  const deliverables = agreement ? getDeliverablesArray() : [];
  const allChecked = deliverables.length === 0 || deliverables.every((_, i) => checkedItems[i]);

  const handleSubmit = async () => {
    if (!deliveryUrl.trim()) {
      setError("Agrega el link a tu entrega");
      return;
    }
    if (!allChecked && deliverables.length > 0) {
      setError("Confirma todos los entregables");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/agreements/${agreementId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryUrl: deliveryUrl.trim(),
          deliveryNote: deliveryNote.trim() || undefined,
          freelancerAddress: wallet,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al entregar");

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al entregar");
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

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Entrega enviada</h2>
          <p className="text-muted-foreground mb-6">
            El empleador revisara tu trabajo. Te notificaremos cuando responda.
          </p>
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
        <Link
          href="/dashboard/freelancer"
          className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 mt-4">
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground mb-1">
            Entregar trabajo
          </h1>
          {agreement && (
            <p className="text-sm text-muted-foreground mb-8">
              {agreement.jobTitle} - {"$"}{agreement.jobAmount} USDC
            </p>
          )}

          {/* Delivery URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Link al trabajo entregado *
            </label>
            <input
              type="url"
              value={deliveryUrl}
              onChange={(e) => setDeliveryUrl(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://drive.google.com/... o https://github.com/..."
            />
          </div>

          {/* Delivery note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Nota de entrega (opcional)
            </label>
            <textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              rows={3}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Instrucciones, notas adicionales..."
            />
          </div>

          {/* Deliverables checklist */}
          {deliverables.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Confirma que incluiste todos los entregables:
              </label>
              <div className="space-y-2">
                {deliverables.map((d, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedItems[i] || false}
                      onChange={(e) => setCheckedItems((prev) => ({ ...prev, [i]: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">{d}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
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
              onClick={handleSubmit}
              disabled={submitting || !deliveryUrl.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Enviando..." : "Enviar entrega"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
