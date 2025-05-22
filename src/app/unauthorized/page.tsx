"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Accès non autorisé
        </h1>
        <p className="text-gray-500 md:text-xl">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette section.
          Seuls les propriétaires et les administrateurs peuvent accéder à cette plateforme.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Button asChild>
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">
              Se connecter avec un autre compte
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 