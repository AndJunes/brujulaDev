import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Pagos protegidos por smart contracts en Stellar
        </div>

        {/* Main headline */}
        <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Trabajo freelance con pagos garantizados
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Publica o encuentra trabajo. Los fondos quedan en garantia hasta que
          apruebes la entrega. Sin intermediarios, sin fraude, sin esperas.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard/employer/create-job"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Publicar Trabajo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Como funciona
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid w-full max-w-2xl grid-cols-3 gap-8 border-t border-border pt-10">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground sm:text-3xl">USDC</span>
            <span className="text-sm text-muted-foreground">Pagos en stablecoin</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground sm:text-3xl">2%</span>
            <span className="text-sm text-muted-foreground">Fee de plataforma</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-foreground sm:text-3xl">~10s</span>
            <span className="text-sm text-muted-foreground">Confirmacion on-chain</span>
          </div>
        </div>
      </div>
    </section>
  );
}
