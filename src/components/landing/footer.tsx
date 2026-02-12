export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <path d="M14 4 L14 14 L22 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
            <circle cx="14" cy="14" r="2" fill="currentColor" className="text-accent" />
          </svg>
          <span className="text-sm font-semibold text-foreground">Brujula</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>Powered by Stellar</span>
          <span className="hidden sm:inline" aria-hidden="true">|</span>
          <span>Escrow by Trustless Work</span>
        </div>

        <p className="text-sm text-muted-foreground">
          Brujula 2026. Hecho en LATAM.
        </p>
      </div>
    </footer>
  );
}
