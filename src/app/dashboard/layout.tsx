"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const wallet = sessionStorage.getItem("brujula_wallet");
    const role = sessionStorage.getItem("brujula_role");

    if (!wallet || !role) {
      router.push("/comenzar");
      return;
    }

    const checkProfile = async () => {
      try {
        const res = await fetch(`/api/users?stellarAddress=${wallet}`);
        const data = await res.json();

        // si no existe perfil → lo mandamos a crearlo
        if (!data.userId) {
          router.push("/profile");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

    checkProfile();
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}