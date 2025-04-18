import type { auth } from "@/lib/auth-client";
import { NextRequest, NextResponse } from "next/server";

// Définition du type Session à partir du type d'auth
// (permet d'avoir l'autocomplétion et la sécurité de type)
type Session = typeof auth.$Infer.Session;

// Middleware Next.js pour protéger les routes
export async function middleware(request: NextRequest) {
  // Appel à l'API pour vérifier la session utilisateur
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
    headers: {
      // On transmet les cookies de la requête pour l'authentification
      cookie: request.headers.get("cookie") || "",
    },
    credentials: "include",
  });
  try {
    // On tente de parser la session retournée par l'API
    const session = await res.json() as Session;
    console.log(session);
    // Si pas de session, on redirige vers la page de login
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Sinon, on laisse passer la requête
    return NextResponse.next();
  } catch (error) {
    // En cas d'erreur (API down, JSON invalide, etc.), on redirige aussi vers /login
    console.error("Failed to get session:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configuration du middleware :
// On applique ce middleware uniquement sur les routes /dashboard et /chat
export const config = {
  matcher: ["/dashboard", "/chat", "/statistiques", "/proprietes"],
};

