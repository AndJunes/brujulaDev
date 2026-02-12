import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              Pagos garantizados para freelancers
            </div>

            <h1 className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-foreground text-balance">
              Cobra seguro.{" "}
              <span className="text-primary">Siempre.</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg text-pretty">
              Brujula garantiza tu pago en trabajos remotos: el cliente deposita antes, vos cobras seguro al instante y sin comisiones altas.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/comenzar"
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-lg text-base font-semibold hover:opacity-90 transition-opacity"
              >
                Comenzar gratis
              </Link>
              <a
                href="#como-funciona"
                className="border border-border text-foreground px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-muted transition-colors"
              >
                Ver como funciona
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-medium text-accent">{'★★★★★'}</div>
                <div className="text-xs text-muted-foreground">+200 freelancers confian en Brujula</div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-person.jpg"
                alt="Freelancer trabajando con Brujula"
                width={600}
                height={700}
                className="object-cover w-full h-[600px]"
                priority
              />
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-5 shadow-xl border border-border">
              <p className="text-xs text-muted-foreground">Comision por transaccion</p>
              <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-primary">1.5%</p>
              <p className="text-xs text-muted-foreground">Sin costos ocultos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
