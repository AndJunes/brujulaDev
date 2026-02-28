"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BrujulaLogo from "@/components/landing/brujula-logo";
import { useWallet } from "@/hooks/useWallet";

export default function CreateJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const { address, isConnected, connect } = useWallet();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    type: "one-time",
    description: "",
    problem: "",
    context: "",
    deliverables: [""],
    requirements: "",
    skills: [] as string[],
    amount: 0,
    estimatedDays: 0,
    deadline: "",
    negotiable: false,
  });

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!isConnected || !address) {
        const connectedAddress = await connect();
        if (!connectedAddress) {
          alert("No se pudo conectar la wallet. Intenta de nuevo.");
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          stellarAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el trabajo");
      }

      router.push("/dashboard/employer");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el trabajo. Intenta de nuevo.");
    }
  };

  const progressWidth = `${(step / 5) * 100}%`;

  const Header = () => (
    <header className="border-b border-[#1a3350] bg-[#040b15] backdrop-blur-sm mb-8">
      <div className="max-w-2xl mx-auto px-6 h-16 flex items-center">
        <Link href="/dashboard/employer" className="flex items-center gap-2">
          <BrujulaLogo size={28} />
          <span className="text-white tracking-[0.25em] text-sm uppercase font-light">
            BRUJULA
          </span>
        </Link>
      </div>
    </header>
  );

  const StepHeader = ({ subtitle }: { subtitle: string }) => (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Publicar Trabajo</h1>
      <p className="text-white/40 text-sm mt-1">{subtitle}</p>
      <div className="w-full bg-[#1a3350] h-2 mt-3 rounded-full">
        <div className="bg-[#356EA6] h-2 rounded-full transition-all" style={{ width: progressWidth }} />
      </div>
    </div>
  );

  const inputClass = "w-full p-3 border border-[#1a3350] rounded-lg bg-[#0a1525] text-white/80 text-sm focus:outline-none focus:border-[#7FB5E2] transition";
  const labelClass = "block text-sm text-white/40 uppercase tracking-wider mb-2";

  // PASO 1: INFORMACIÓN BÁSICA
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#040b15]">
        <Header />
        <div className="max-w-2xl mx-auto px-6">
          <StepHeader subtitle="Paso 1 de 5: Informacion basica" />

          <div className="bg-[#12263a] border border-[#1a3350] rounded-2xl p-8 space-y-6">
            <div>
              <label className={labelClass}>
                Titulo del trabajo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Logo para startup de fintech"
                className={inputClass}
                value={formData.title}
                onChange={(e) => updateForm("title", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>
                Categoria <span className="text-red-400">*</span>
              </label>
              <select
                className={inputClass}
                value={formData.category}
                onChange={(e) => updateForm("category", e.target.value)}
              >
                <option value="">Selecciona una categoria</option>
                <option value="design">Diseno</option>
                <option value="development">Desarrollo</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Redaccion</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Tipo de proyecto</label>
              <div className="flex gap-4">
                <label className="flex items-center text-white/60 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="one-time"
                    checked={formData.type === "one-time"}
                    onChange={(e) => updateForm("type", e.target.value)}
                    className="mr-2 accent-[#356EA6]"
                  />
                  Proyecto unico
                </label>
                <label className="flex items-center text-white/60 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="ongoing"
                    checked={formData.type === "ongoing"}
                    onChange={(e) => updateForm("type", e.target.value)}
                    className="mr-2 accent-[#356EA6]"
                  />
                  Trabajo continuo
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => router.push("/dashboard/employer")}
                className="px-6 py-2 border border-[#1a3350] rounded-lg text-sm text-white/40 hover:text-white hover:border-[#7FB5E2] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.title || !formData.category}
                className="px-6 py-2 bg-[#356EA6] hover:bg-[#7FB5E2] text-white rounded-lg text-sm font-medium disabled:opacity-50 transition cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PASO 2: DESCRIPCIÓN DETALLADA
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#040b15]">
        <Header />
        <div className="max-w-2xl mx-auto px-6">
          <StepHeader subtitle="Paso 2 de 5: Descripcion detallada" />

          <div className="bg-[#12263a] border border-[#1a3350] rounded-2xl p-8 space-y-6">
            <div>
              <label className={labelClass}>
                Descripcion completa <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe el trabajo en detalle..."
                className={inputClass + " resize-none"}
                value={formData.description}
                onChange={(e) => updateForm("description", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Que problema estas resolviendo?</label>
              <textarea
                rows={3}
                placeholder="Explica el problema o necesidad..."
                className={inputClass + " resize-none"}
                value={formData.problem}
                onChange={(e) => updateForm("problem", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Contexto del proyecto</label>
              <textarea
                rows={3}
                placeholder="Informacion adicional sobre tu empresa/proyecto..."
                className={inputClass + " resize-none"}
                value={formData.context}
                onChange={(e) => updateForm("context", e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-[#1a3350] rounded-lg text-sm text-white/40 hover:text-white hover:border-[#7FB5E2] transition cursor-pointer"
              >
                Atras
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.description}
                className="px-6 py-2 bg-[#356EA6] hover:bg-[#7FB5E2] text-white rounded-lg text-sm font-medium disabled:opacity-50 transition cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PASO 3: ENTREGABLES Y REQUISITOS
  if (step === 3) {
    const addDeliverable = () => {
      setFormData((prev) => ({
        ...prev,
        deliverables: [...prev.deliverables, ""],
      }));
    };

    const updateDeliverable = (index: number, value: string) => {
      const newDeliverables = [...formData.deliverables];
      newDeliverables[index] = value;
      setFormData((prev) => ({ ...prev, deliverables: newDeliverables }));
    };

    const removeDeliverable = (index: number) => {
      if (formData.deliverables.length > 1) {
        const newDeliverables = formData.deliverables.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, deliverables: newDeliverables }));
      }
    };

    return (
      <div className="min-h-screen bg-[#040b15]">
        <Header />
        <div className="max-w-2xl mx-auto px-6">
          <StepHeader subtitle="Paso 3 de 5: Entregables y requisitos" />

          <div className="bg-[#12263a] border border-[#1a3350] rounded-2xl p-8 space-y-6">
            <div>
              <label className={labelClass}>
                Que debe incluir la entrega? <span className="text-red-400">*</span>
              </label>
              {formData.deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Entregable ${index + 1}`}
                    className={inputClass}
                    value={deliverable}
                    onChange={(e) => updateDeliverable(index, e.target.value)}
                  />
                  {formData.deliverables.length > 1 && (
                    <button
                      onClick={() => removeDeliverable(index)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 transition cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addDeliverable}
                className="text-[#7FB5E2] text-sm mt-1 hover:text-white transition cursor-pointer"
              >
                + Agregar otro entregable
              </button>
            </div>

            <div>
              <label className={labelClass}>Requisitos especiales</label>
              <textarea
                rows={3}
                placeholder="Experiencia requerida, herramientas especificas, etc..."
                className={inputClass + " resize-none"}
                value={formData.requirements}
                onChange={(e) => updateForm("requirements", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Skills necesarios</label>
              <input
                type="text"
                placeholder="Ej: React, Diseno UX, Copywriting (separados por coma)"
                className={inputClass}
                value={formData.skills.join(", ")}
                onChange={(e) =>
                  updateForm(
                    "skills",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  )
                }
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-[#1a3350] rounded-lg text-sm text-white/40 hover:text-white hover:border-[#7FB5E2] transition cursor-pointer"
              >
                Atras
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!formData.deliverables[0]}
                className="px-6 py-2 bg-[#356EA6] hover:bg-[#7FB5E2] text-white rounded-lg text-sm font-medium disabled:opacity-50 transition cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PASO 4: PRESUPUESTO Y TIEMPO
  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#040b15]">
        <Header />
        <div className="max-w-2xl mx-auto px-6">
          <StepHeader subtitle="Paso 4 de 5: Presupuesto y tiempo" />

          <div className="bg-[#12263a] border border-[#1a3350] rounded-2xl p-8 space-y-6">
            <div>
              <label className={labelClass}>
                Presupuesto (USDC) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-white/30">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="500"
                  className={inputClass + " pl-8"}
                  value={formData.amount || ""}
                  onChange={(e) => updateForm("amount", Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Tiempo estimado (dias) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="7"
                className={inputClass}
                value={formData.estimatedDays || ""}
                onChange={(e) => updateForm("estimatedDays", Number(e.target.value))}
              />
            </div>

            <div>
              <label className={labelClass}>Fecha limite (opcional)</label>
              <input
                type="date"
                className={inputClass}
                value={formData.deadline}
                onChange={(e) => updateForm("deadline", e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-center text-white/60 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.negotiable}
                  onChange={(e) => updateForm("negotiable", e.target.checked)}
                  className="mr-2 accent-[#356EA6]"
                />
                El presupuesto es negociable
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-[#1a3350] rounded-lg text-sm text-white/40 hover:text-white hover:border-[#7FB5E2] transition cursor-pointer"
              >
                Atras
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={!formData.amount || !formData.estimatedDays}
                className="px-6 py-2 bg-[#356EA6] hover:bg-[#7FB5E2] text-white rounded-lg text-sm font-medium disabled:opacity-50 transition cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PASO 5: REVISIÓN
  if (step === 5) {
    const platformFee = formData.amount * 0.02;
    const total = formData.amount + platformFee;

    return (
      <div className="min-h-screen bg-[#040b15]">
        <Header />
        <div className="max-w-2xl mx-auto px-6">
          <StepHeader subtitle="Paso 5 de 5: Confirma que todo este correcto" />

          {/* Summary */}
          <div className="bg-[#12263a] border border-[#1a3350] rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              {formData.title || "Sin titulo"}
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-white/40">Presupuesto:</span>
                <p className="font-medium text-white">${formData.amount} USDC</p>
              </div>
              <div>
                <span className="text-white/40">Tiempo estimado:</span>
                <p className="font-medium text-white">{formData.estimatedDays} dias</p>
              </div>
              <div>
                <span className="text-white/40">Categoria:</span>
                <p className="font-medium text-white capitalize">{formData.category}</p>
              </div>
              <div>
                <span className="text-white/40">Descripcion:</span>
                <p className="text-white/70">{formData.description}</p>
              </div>
              <div>
                <span className="text-white/40">Entregables:</span>
                <ul className="list-disc list-inside">
                  {formData.deliverables.map((d, i) => (
                    <li key={i} className="text-white/70">{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="bg-[#356EA6]/10 border border-[#356EA6]/30 rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-white mb-3">Desglose de costos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Presupuesto del trabajo:</span>
                <span>${formData.amount.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Fee de plataforma (2%):</span>
                <span>${platformFee.toFixed(2)} USDC</span>
              </div>
              <div className="border-t border-[#1a3350] pt-2 mt-2">
                <div className="flex justify-between font-bold text-white">
                  <span>Total a depositar:</span>
                  <span>${total.toFixed(2)} USDC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Escrow info */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6 text-sm">
            <p className="font-medium text-yellow-400 mb-1">Por que depositar ahora?</p>
            <p className="text-white/50">
              Los fondos quedan en garantia (no se tocan). Solo se liberan cuando
              apruebes el trabajo. Genera confianza con freelancers.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2 border border-[#1a3350] rounded-lg text-sm text-white/40 hover:text-white hover:border-[#7FB5E2] transition cursor-pointer"
            >
              Atras
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#356EA6] hover:bg-[#7FB5E2] text-white rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Publicar trabajo
            </button>
          </div>
        </div>
      </div>
    );
  }
}
