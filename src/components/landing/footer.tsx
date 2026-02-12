import BrujulaLogo from "./brujula-logo";

export default function Footer() {
  return (
    <footer className="py-16" style={{ background: "var(--prussian)", color: "var(--mint)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BrujulaLogo size={28} />
              <span className="font-[family-name:var(--font-heading)] text-lg font-bold">BRUJULA</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--powder)" }}>
              La primera capa de confianza verificable para freelancers en LATAM.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-semibold mb-4 text-sm">Producto</h4>
            <ul className="space-y-2 text-sm" style={{ color: "var(--powder)" }}>
              <li><a href="#como-funciona" className="hover:text-[var(--mint)] transition-colors">Como funciona</a></li>
              <li><a href="#por-que-brujula" className="hover:text-[var(--mint)] transition-colors">Por que Brujula</a></li>
              <li><a href="#modelo" className="hover:text-[var(--mint)] transition-colors">Precios</a></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-semibold mb-4 text-sm">Recursos</h4>
            <ul className="space-y-2 text-sm" style={{ color: "var(--powder)" }}>
              <li><span className="cursor-default">Blog</span></li>
              <li><span className="cursor-default">Documentacion</span></li>
              <li><span className="cursor-default">FAQ</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm" style={{ color: "var(--powder)" }}>
              <li><span className="cursor-default">Terminos</span></li>
              <li><span className="cursor-default">Privacidad</span></li>
              <li><span className="cursor-default">Compliance</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-sm" style={{ borderColor: "var(--oxford)", color: "var(--powder)" }}>
          2026 Brujula. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
