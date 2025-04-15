import { useRouter } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/auth-client"
import { useRef, useState } from "react";

interface SignInCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email regex for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailIsValid = emailRegex.test(email);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const credentials: SignInCredentials = {
      email: emailRef.current?.value || "",
      password: passwordRef.current?.value || "",
      rememberMe: true
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.status !== 200) {
        setError("L'authentification a échoué. Veuillez réessayer.");
      } else {
        if(!data.user.emailVerified) { 
          setError("Veuillez vérifier votre adresse email.");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue s'est produite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Pluton</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Pluton</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Votre adresse email</Label>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                autoFocus
                className="bg-[#181830] text-white border-[#3a3a56] placeholder:text-gray-500 focus:border-primary"
              />
              {emailTouched && !emailIsValid && (
                <div className="text-red-500 text-xs mt-1">Veuillez entrer une adresse email valide.</div>
              )}
            </div>
            {emailIsValid && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    ref={passwordRef}
                    id="password"
                    type="password"
                    placeholder=""
                    required
                    className="bg-[#181830] text-white border-[#3a3a56] placeholder:text-gray-500 focus:border-primary"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion en cours..." : "Connexion"}
                </Button>
                {error && (
                  <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
                )}
              </>
            )}
          </div>
          <div className="after:border-[#3a3a56] relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-[#0A0A22] text-gray-400 relative z-10 px-2">
              Or
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-1">
            <Button
              type="button"
              className="w-full bg-[#181830] text-white border-[#3a3a56] hover:bg-[#232347] hover:border-primary hover:text-white focus-visible:ring-2 focus-visible:ring-primary/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={
                () => {
                  setLoading(true);
                  signIn.social({
                    provider: "google"
                  }).then(() => {
                    router.push("/dashboard");
                  }).catch((err) => {
                    setError(err.message || "Une erreur inattendue s'est produite.");
                  }).finally(() => {
                    setLoading(false);
                  });
                }
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </div> 
        </div>
      </form>
      <div className="text-gray-400 *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
