import Link from "next/link";

export function ForWhom() {
  return (
    <section id="para-quien" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Para quien
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Dos caminos, un mismo destino
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Ya seas empleador o freelancer, Brujula te protege en cada paso del
            proceso.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Employer card */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8 lg:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M20 7h-9" />
                <path d="M14 17H5" />
                <circle cx="17" cy="17" r="3" />
                <circle cx="7" cy="7" r="3" />
              </svg>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-foreground">
              Para empleadores
            </h3>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              Publica tu proyecto, deposita el presupuesto en escrow, y elige
              al mejor freelancer. Solo liberas el pago cuando estes satisfecho
              con la entrega.
            </p>
            <ul className="mb-8 flex flex-col gap-3">
              {[
                "Fondos protegidos en smart contract",
                "Solo pagas si apruebes el trabajo",
                "Acceso a talento de toda LATAM",
                "Fee transparente de solo 2%",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-card-foreground">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0 text-primary" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/employer/create-job"
              className="mt-auto inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Publicar un trabajo
            </Link>
          </div>

          {/* Freelancer card */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8 lg:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <h3 className="mb-3 text-2xl font-bold text-foreground">
              Para freelancers
            </h3>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              Encuentra proyectos con fondos ya depositados. Trabaja tranquilo
              sabiendo que el pago esta garantizado antes de empezar.
            </p>
            <ul className="mb-8 flex flex-col gap-3">
              {[
                "Pago garantizado antes de trabajar",
                "Cobra en USDC directo a tu wallet",
                "Sin esperar 30-60-90 dias",
                "Transacciones verificables on-chain",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-card-foreground">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0 text-accent" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/employer/create-job"
              className="mt-auto inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Buscar trabajos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
