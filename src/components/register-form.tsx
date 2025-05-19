import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRef, useState } from "react";

interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email regex for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailIsValid = emailRegex.test(email);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const credentials: RegisterCredentials = {
      email: emailRef.current?.value || "",
      password: passwordRef.current?.value || "",
      name: nameRef.current?.value || undefined,
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.message || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }
      router.push("/login");
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className={cn("space-y-4", className)} {...props}>
      <div>
        <Label htmlFor="name">Nom</Label>
        <Input id="name" ref={nameRef} placeholder="Votre nom" autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="email">Votre adresse email</Label>
        <Input
          id="email"
          ref={emailRef}
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          required
        />
        {emailTouched && !emailIsValid && (
          <div className="text-destructive text-sm mt-1">Veuillez entrer une adresse email valide.</div>
        )}
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" ref={passwordRef} type="password" autoComplete="new-password" required />
      </div>
      {error && <div className="text-destructive text-sm">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading || !emailIsValid}>
        {loading ? "Création du compte..." : "Créer un compte"}
      </Button>
    </form>
  );
}
