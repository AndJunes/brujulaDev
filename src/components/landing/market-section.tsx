import Image from "next/image";

const reasons = [
  {
    title: "El dolar digital es mainstream",
    text: "El 70% de los freelancers argentinos ya elige stablecoins. La infraestructura cripto ya no asusta: es invisible, rapida y barata.",
  },
  {
    title: "El escrow programable es viable",
    text: "Stellar permite contratos inteligentes simples, predecibles y de costo casi cero. La tecnologia maduro para desaparecer.",
  },
  {
    title: "Las plataformas tradicionales expulsan talento",
    text: "Upwork cobra hasta 32%. Los freelancers migran a clientes directos pero terminan desprotegidos. El mercado off-platform es enorme.",
  },
];

export default function MarketSection() {
  return (
    <section id="mercado" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Por que ahora
            </p>
            <h2 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl font-bold text-foreground mb-12 text-balance">
              Tres fuerzas convergen en 2026.
            </h2>

            <div className="space-y-8">
              {reasons.map((item, i) => (
                <div key={item.title} className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-[family-name:var(--font-heading)] font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative hidden lg:block rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/desk.jpg"
              alt="Escritorio moderno de freelancer"
              width={600}
              height={500}
              className="object-cover w-full h-[500px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
