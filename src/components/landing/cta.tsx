import Link from "next/link";

export function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl rounded-2xl bg-primary px-8 py-16 text-center sm:px-16">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Empieza a trabajar con confianza
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
          Conecta tu wallet Freighter y publica tu primer trabajo o aplica a
          uno. El futuro del freelancing en LATAM esta aqui.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/dashboard/employer/create-job"
            className="inline-flex items-center justify-center rounded-lg bg-card px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Conectar Wallet
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center rounded-lg border border-primary-foreground/30 px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            Ver como funciona
          </a>
        </div>
      </div>
    </section>
  );
}
