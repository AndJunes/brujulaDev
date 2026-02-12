import Link from "next/link";
import BrujulaLogo from "./brujula-logo";

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: "var(--prussian)" }}>
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--prussian)]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8">
          <BrujulaLogo size={64} />
        </div>

        <h2 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold mb-6 text-balance" style={{ color: "var(--mint)" }}>
          Todavia aceptas trabajos sin garantia?
        </h2>

        <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-pretty" style={{ color: "var(--powder)" }}>
          Empeza a cobrar seguro. Sin comisiones altas, sin esperar 30 dias, sin depender de la buena voluntad del cliente.
        </p>

        <Link
          href="/comenzar"
          className="inline-flex items-center justify-center bg-primary-foreground px-10 py-4 rounded-lg text-lg font-bold hover:opacity-90 transition-opacity"
          style={{ color: "var(--prussian)" }}
        >
          Comenzar gratis
        </Link>
      </div>
    </section>
  );
}
