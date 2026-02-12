import Image from "next/image";

export default function ProblemSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/workspace.jpg"
              alt="Espacio de trabajo freelance"
              width={600}
              height={500}
              className="object-cover w-full h-[450px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-prussian/60 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <p className="text-sm font-semibold text-primary-foreground/70 uppercase tracking-wider mb-2">
                El problema
              </p>
              <h3 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-primary-foreground">
                No sabes si te van a pagar.
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              1 de cada 2 freelancers en LATAM fue estafado o sufrio impagos. Las comisiones te matan y cobrar tu propio dinero es complicado.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Las fintechs compiten por velocidad. Brujula compite por seguridad. Mientras PayPal, Wise y Global66 mueven dinero, Brujula lo retiene hasta que el trabajo esta listo.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="text-center">
                <p className="font-[family-name:var(--font-heading)] text-4xl font-bold text-primary">50%</p>
                <p className="text-sm text-muted-foreground mt-1">freelancers estafados</p>
              </div>
              <div className="text-center">
                <p className="font-[family-name:var(--font-heading)] text-4xl font-bold text-primary">70%</p>
                <p className="text-sm text-muted-foreground mt-1">cobran en USD digital</p>
              </div>
              <div className="text-center">
                <p className="font-[family-name:var(--font-heading)] text-4xl font-bold text-primary">$600M</p>
                <p className="text-sm text-muted-foreground mt-1">mercado LATAM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
