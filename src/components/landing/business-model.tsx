const items = [
  {
    value: "1.5%",
    label: "Fee por transaccion",
    desc: "Pagado solo al cobrar",
  },
  {
    value: "<0.1%",
    label: "Costo directo",
    desc: "Stellar + infraestructura",
  },
  {
    value: ">93%",
    label: "Margen bruto",
    desc: "Economia de escala",
  },
  {
    value: "$0",
    label: "Costo para el cliente",
    desc: "Deposita el monto exacto",
  },
];

export default function BusinessModel() {
  return (
    <section id="modelo" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Modelo de negocio
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
            Brujula gana solo cuando vos cobras.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Sin suscripciones, sin costos escondidos, sin penalizacion por no usar la plataforma. Zero float, zero custodia.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.label}
              className="text-center p-8 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <p className="font-[family-name:var(--font-heading)] text-4xl font-bold text-primary mb-2">
                {item.value}
              </p>
              <p className="font-semibold text-foreground text-sm mb-1">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
