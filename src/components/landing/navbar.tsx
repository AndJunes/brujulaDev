"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <path d="M14 4 L14 14 L22 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
            <circle cx="14" cy="14" r="2" fill="currentColor" className="text-accent" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-foreground font-sans">
            Brujula
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#como-funciona" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Como funciona
          </a>
          <a href="#ventajas" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Ventajas
          </a>
          <a href="#para-quien" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Para quien
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/dashboard/employer/create-job"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Conectar Wallet
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center rounded-lg p-2 text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#como-funciona" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">
              Como funciona
            </a>
            <a href="#ventajas" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">
              Ventajas
            </a>
            <a href="#para-quien" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">
              Para quien
            </a>
            <Link
              href="/dashboard/employer/create-job"
              className="rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Conectar Wallet
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
