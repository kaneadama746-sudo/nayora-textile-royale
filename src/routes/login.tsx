import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion admin — NAYORA TEXTILE" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err?.message ?? "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--gradient-royal)" }}>
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-[var(--shadow-royal)]">
        <div className="text-center mb-8">
          <Crown className="h-10 w-10 text-gold mx-auto mb-3" />
          <h1 className="font-serif text-2xl text-primary">Espace administrateur</h1>
          <p className="text-sm text-muted-foreground mt-1">NAYORA TEXTILE</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                 placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                 placeholder="Mot de passe" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>
        <button onClick={() => setMode(m => m === "signin" ? "signup" : "signin")}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-primary transition">
          {mode === "signin" ? "Créer un compte administrateur" : "J'ai déjà un compte"}
        </button>
        <Link to="/" className="block mt-6 text-center text-xs text-muted-foreground hover:text-gold">
          ← Retour au site
        </Link>
      </div>
    </div>
  );
}
