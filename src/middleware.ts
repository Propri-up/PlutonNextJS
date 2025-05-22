// Middleware Next.js pour protéger certaines routes (authentification)
// On importe le type d'auth et les helpers Next.js
import type { auth } from "@/lib/auth-client";
import { NextRequest, NextResponse } from "next/server";

// On définit le type Session à partir du type d'auth
// Cela permet d'avoir l'autocomplétion et la vérification de type sur la session utilisateur
// (utile si tu veux accéder à des propriétés de session plus tard)
type Session = typeof auth.$Infer.Session;

// Middleware exécuté à chaque requête sur les routes protégées
export async function middleware(request: NextRequest) {
  // On appelle l'API backend pour récupérer la session utilisateur
  // On transmet les cookies du navigateur pour l'authentification
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
    credentials: "include",
  });
  try {
    // On tente de parser la session
    const session = await res.json() as Session;
    console.log(session); // Pour debug : affiche la session côté serveur
    // Si pas de session (utilisateur non connecté), on redirige vers /login
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Sinon, on laisse passer la requête
    return NextResponse.next();
  } catch (error) {
    // Si erreur (ex: backend down, JSON mal formé), on redirige aussi vers /login
    console.error("Failed to get session:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configuration du middleware : sur quelles routes il s'applique
// Ici, il protège /dashboard, /chat, /properties, /documents, /account
export const config = {
  matcher: ["/dashboard", "/chat","/properties", "/documents", "/account"],
};