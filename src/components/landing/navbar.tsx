"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import BrujulaLogo from "./brujula-logo";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <BrujulaLogo size={32} />
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-foreground">
              BRUJULA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como funciona
            </a>
            <a href="#por-que-brujula" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Por que Brujula
            </a>
            <a href="#mercado" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mercado
            </a>
            <a href="#modelo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Modelo
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/comenzar"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/comenzar"
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Comenzar gratis
            </Link>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <a href="#como-funciona" className="block text-sm text-muted-foreground hover:text-foreground px-2 py-1">Como funciona</a>
            <a href="#por-que-brujula" className="block text-sm text-muted-foreground hover:text-foreground px-2 py-1">Por que Brujula</a>
            <a href="#mercado" className="block text-sm text-muted-foreground hover:text-foreground px-2 py-1">Mercado</a>
            <a href="#modelo" className="block text-sm text-muted-foreground hover:text-foreground px-2 py-1">Modelo</a>
            <Link
              href="/comenzar"
              className="block bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium text-center hover:opacity-90 transition-opacity"
            >
              Comenzar gratis
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
