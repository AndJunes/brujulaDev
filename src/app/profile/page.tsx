"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileData = {
  name: string;
  username: string;
  bio: string;
  country: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [wallet, setWallet] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileData>({
    name: "",
    username: "",
    bio: "",
    country: "",
  });

  const [loading, setLoading] = useState(true);

  // 🔐 check sesión
  useEffect(() => {
    const storedWallet = sessionStorage.getItem("brujula_wallet");
    const storedRole = sessionStorage.getItem("brujula_role");

    if (!storedWallet || !storedRole) {
      router.push("/comenzar");
      return;
    }

    setWallet(storedWallet);
    setRole(storedRole);

    // comprobar si ya existe perfil en localStorage
    const existingProfile = localStorage.getItem(
      `brujula_profile_${storedWallet}`
    );

    if (existingProfile) {
      router.push(`/dashboard/${storedRole}`);
      return;
    }

    setLoading(false);
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet || !role) return;

    localStorage.setItem(
      `brujula_profile_${wallet}`,
      JSON.stringify(form)
    );

    router.push(`/dashboard/${role}`);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-10 shadow-sm">

        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Crear perfil
          </h1>
          <p className="text-muted-foreground mt-2">
            Este perfil será visible para otros usuarios dentro de Brújula.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* nombre */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre completo
            </label>
            <input
              name="name"
              required
              onChange={handleChange}
              value={form.name}
              placeholder="Ej: Andrea Junes"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>

          {/* username */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre de usuario
            </label>
            <input
              name="username"
              required
              onChange={handleChange}
              value={form.username}
              placeholder="Ej: andrea.dev"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>

          {/* país */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              País
            </label>
            <input
              name="country"
              required
              onChange={handleChange}
              value={form.country}
              placeholder="Ej: Argentina"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>

          {/* bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio profesional
            </label>
            <textarea
              name="bio"
              required
              rows={4}
              onChange={handleChange}
              value={form.bio}
              placeholder="Describe tu experiencia, habilidades y tipo de trabajos que realizas."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>

          {/* botón */}
          <button
            type="submit"
            className="w-full bg-foreground text-background py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Guardar y continuar
          </button>
        </form>
      </div>
    </div>
  );
}