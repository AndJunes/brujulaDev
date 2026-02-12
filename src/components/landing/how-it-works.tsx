import { Shield, Lock, Zap, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Shield,
    number: "01",
    title: "El cliente deposita",
    description:
      "El cliente deposita el monto exacto del acuerdo antes de empezar. Sin registros complicados.",
  },
  {
    icon: Lock,
    number: "02",
    title: "Fondos en escrow",
    description:
      "Los fondos quedan reservados en un smart contract sobre Stellar. Seguros e intocables.",
  },
  {
    icon: Zap,
    number: "03",
    title: "Entregas y cobras",
    description:
      "Cuando entregas y el cliente confirma, el pago se libera automaticamente al instante.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Como funciona
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Simple. Seguro. Instantaneo.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <step.icon className="w-7 h-7 text-primary" />
              </div>

              <span className="text-xs font-bold text-primary/50 tracking-widest mb-2">
                {step.number}
              </span>

              <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed text-sm max-w-xs">
                {step.description}
              </p>

              {i < 2 && (
                <div className="hidden md:block absolute top-8 -right-4 translate-x-1/2">
                  <ArrowRight className="w-5 h-5 text-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
