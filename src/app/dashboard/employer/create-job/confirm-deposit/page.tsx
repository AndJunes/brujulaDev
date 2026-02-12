"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

type DepositStep = "loading" | "ready" | "signing" | "sending" | "success" | "error";

export default function ConfirmDepositPage() {
  const router = useRouter();
  const { address, isConnected, connect, signTransaction } = useWallet();

  const [step, setStep] = useState<DepositStep>("loading");
  const [jobId, setJobId] = useState<string | null>(null);
  const [engagementId, setEngagementId] = useState<string | null>(null);
  const [unsignedXdr, setUnsignedXdr] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Recover pending job data from sessionStorage
  useEffect(() => {
    const pendingJobId = sessionStorage.getItem("pendingJobId");
    const pendingEngagementId = sessionStorage.getItem("pendingEngagementId");

    if (!pendingJobId || !pendingEngagementId) {
      setErrorMsg("No se encontraron datos del trabajo pendiente. Vuelve a crear el trabajo.");
      setStep("error");
      return;
    }

    setJobId(pendingJobId);
    setEngagementId(pendingEngagementId);
    setStep("ready");
  }, []);

  // Step 1: Deploy escrow via Trustless Work API (gets unsigned XDR)
  const handleDeployEscrow = async () => {
    try {
      setStep("loading");

      // Ensure wallet is connected
      let walletAddress = address;
      if (!isConnected || !walletAddress) {
        walletAddress = await connect();
        if (!walletAddress) {
          setErrorMsg("No se pudo conectar la wallet. Asegurate de tener Freighter abierto.");
          setStep("error");
          return;
        }
      }

      // Fetch job data from the database to get amount/title
      const jobRes = await fetch(`/api/jobs/${jobId}`);
      let jobData = { title: "Trabajo Brujula", description: "", amount: 0 };
      if (jobRes.ok) {
        jobData = await jobRes.json();
      }

      // Call escrow deploy to get the unsigned XDR
      const response = await fetch("/api/escrow/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signer: walletAddress,
          title: jobData.title || "Trabajo Brujula",
          description: jobData.description || "",
          amount: jobData.amount || 0,
          platformFee: Math.round((jobData.amount || 0) * 0.02 * 100) / 100,
          milestones: [{ description: "Entrega completa del trabajo" }],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al desplegar el escrow");
      }

      setUnsignedXdr(data.unsignedXdr);
      setStep("ready");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Error desconocido");
      setStep("error");
    }
  };

  // Step 2: Sign the XDR with Freighter and send it
  const handleSignAndSend = async () => {
    try {
      if (!unsignedXdr) {
        // If we don't have an XDR yet, deploy first
        await handleDeployEscrow();
        return;
      }

      setStep("signing");

      // Open Freighter to sign the transaction
      const signedXdr = await signTransaction(unsignedXdr);

      if (!signedXdr) {
        throw new Error("La firma fue cancelada o falló");
      }

      setStep("sending");

      // Send the signed transaction to Stellar via Trustless Work
      const response = await fetch("/api/escrow/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedXdr,
          jobId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al enviar la transaccion");
      }

      setContractId(data.contractId);
      setStep("success");

      // Clean up sessionStorage
      sessionStorage.removeItem("pendingJobId");
      sessionStorage.removeItem("pendingEngagementId");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Error al firmar");
      setStep("error");
    }
  };

  // LOADING state
  if (step === "loading") {
    return (
      <div className="max-w-lg mx-auto p-6 mt-12">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[hsl(var(--primary))] border-r-transparent mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Preparando escrow...</h2>
          <p className="text-muted-foreground mt-2">Conectando con Trustless Work y Stellar</p>
        </div>
      </div>
    );
  }

  // ERROR state
  if (step === "error") {
    return (
      <div className="max-w-lg mx-auto p-6 mt-12">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">!</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Algo salio mal</h2>
          <p className="text-muted-foreground mb-6">{errorMsg}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard/employer/create-job")}
              className="px-5 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Volver al formulario
            </button>
            <button
              onClick={() => {
                setErrorMsg("");
                setStep("ready");
              }}
              className="px-5 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS state
  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto p-6 mt-12">
        <div className="bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[hsl(var(--primary-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Escrow creado exitosamente</h2>
          <p className="text-muted-foreground mb-4">
            Tu trabajo ha sido publicado y los fondos estan en garantia en la blockchain de Stellar.
          </p>
          {contractId && (
            <div className="bg-muted rounded-lg p-3 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Contract ID</p>
              <p className="text-sm font-mono text-foreground break-all">{contractId}</p>
            </div>
          )}
          <button
            onClick={() => router.push("/dashboard/employer")}
            className="px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // SIGNING state
  if (step === "signing") {
    return (
      <div className="max-w-lg mx-auto p-6 mt-12">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[hsl(var(--primary))] border-r-transparent mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Firmando con Freighter...</h2>
          <p className="text-muted-foreground mt-2">
            Revisa y aprueba la transaccion en tu extension de Freighter
          </p>
        </div>
      </div>
    );
  }

  // SENDING state
  if (step === "sending") {
    return (
      <div className="max-w-lg mx-auto p-6 mt-12">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[hsl(var(--primary))] border-r-transparent mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Enviando a Stellar...</h2>
          <p className="text-muted-foreground mt-2">
            Tu transaccion firmada esta siendo enviada a la red Stellar
          </p>
        </div>
      </div>
    );
  }

  // READY state - main deposit confirmation screen
  return (
    <div className="max-w-lg mx-auto p-6 mt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Confirmar Deposito</h1>
        <p className="text-muted-foreground mt-1">
          Despliega el contrato escrow y firma con tu wallet
        </p>
      </div>

      {/* Wallet status */}
      <div className="bg-muted rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Wallet conectada</span>
          {isConnected && address ? (
            <span className="text-sm font-mono text-foreground">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          ) : (
            <button
              onClick={connect}
              className="text-sm text-[hsl(var(--primary))] hover:underline"
            >
              Conectar Freighter
            </button>
          )}
        </div>
      </div>

      {/* Job info */}
      <div className="bg-muted rounded-xl p-4 mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Job ID</span>
          <span className="text-sm font-mono text-foreground">{jobId?.slice(0, 12)}...</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Engagement ID</span>
          <span className="text-sm font-mono text-foreground">{engagementId?.slice(0, 20)}...</span>
        </div>
      </div>

      {/* Flow explanation */}
      <div className="border border-border rounded-xl p-4 mb-6">
        <h3 className="font-medium text-foreground mb-3">Que va a pasar:</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            Se crea el contrato escrow en Trustless Work
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            Freighter se abrira para que firmes la transaccion
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            La transaccion firmada se envia a la red Stellar
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">4.</span>
            Los fondos quedan bloqueados en el smart contract
          </li>
        </ol>
      </div>

      {/* Security note */}
      <div className="bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/30 rounded-xl p-4 mb-8 text-sm">
        <p className="font-medium text-foreground mb-1">Fondos protegidos</p>
        <p className="text-muted-foreground">
          Los USDC quedan en un contrato inteligente en Stellar. Solo se liberan cuando apruebes
          la entrega del trabajo. Si hay una disputa, un arbitro neutral la resuelve.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/dashboard/employer/create-job")}
          className="flex-1 px-5 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        {!unsignedXdr ? (
          <button
            onClick={handleDeployEscrow}
            disabled={!isConnected}
            className="flex-1 px-5 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crear Escrow
          </button>
        ) : (
          <button
            onClick={handleSignAndSend}
            className="flex-1 px-5 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Firmar con Freighter
          </button>
        )}
      </div>
    </div>
  );
}
