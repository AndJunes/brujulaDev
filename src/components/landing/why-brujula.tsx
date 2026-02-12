import { ShieldCheck, Users, Database, Globe, TrendingUp, CheckCircle } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Escrow programable",
    description: "Smart contracts sobre Stellar. Sin intermediacion humana. Sin wallets complejas.",
  },
  {
    icon: Users,
    title: "Red de confianza",
    description: "Cada freelancer que usa Brujula incorpora a sus clientes. El estandar se expande solo.",
  },
  {
    icon: Database,
    title: "Historial portable",
    description: "Tu reputacion verificable te pertenece. Pagos cumplidos, tiempos de entrega, relaciones.",
  },
  {
    icon: Globe,
    title: "Sin friccion cripto",
    description: "Infraestructura invisible. Sin seeds, sin wallets. Solo depositas y cobras.",
  },
  {
    icon: TrendingUp,
    title: "Margen bruto >93%",
    description: "Costo directo <0.1% sobre Stellar. Escalamos sin multiplicar costos operativos.",
  },
  {
    icon: CheckCircle,
    title: "Compliance first",
    description: "Operamos con compliance por diseno. Regulacion first-mover en escrow programable.",
  },
];

export default function WhyBrujula() {
  return (
    <section id="por-que-brujula" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Por que Brujula
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
            No somos otro riel de pagos.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            Somos la primera capa de confianza verificable antes de trabajar. Garantizamos el pago antes, no despues.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="group flex gap-4 p-6 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-heading)] font-semibold text-foreground mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
