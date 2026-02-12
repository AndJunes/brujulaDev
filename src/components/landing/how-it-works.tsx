const steps = [
  {
    number: "01",
    title: "Conecta tu wallet",
    description:
      "Instala Freighter y conecta tu wallet de Stellar. Tu direccion publica es tu identidad, sin passwords ni emails.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M22 10H2" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Publica o aplica",
    description:
      "Empleadores publican trabajos con presupuesto en USDC. Freelancers buscan, filtran y aplican a los que les interesen.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Fondos en garantia",
    description:
      "Al publicar, el empleador deposita los USDC en un smart contract. Los fondos quedan protegidos hasta la entrega.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Entrega y cobra",
    description:
      "Freelancer entrega el trabajo, empleador revisa y aprueba. Los fondos se liberan automaticamente a la wallet del freelancer.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4 12 14.01l-3-3" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Proceso simple
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Como funciona Brujula
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Cuatro pasos para conectar talento con oportunidades, con pagos
            protegidos de principio a fin.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <span className="mb-4 text-xs font-bold tracking-widest text-accent">
                {step.number}
              </span>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {step.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
