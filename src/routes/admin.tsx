import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  listQuoteRequests,
  updateQuoteRequest,
  deleteQuoteRequest,
  checkIsAdmin,
} from "@/lib/quotes.functions";
import { Crown, Loader2, LogOut, Phone, Mail, MessageCircle, Trash2, RefreshCw, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

const ADMIN_WHATSAPP = "221773671046";
const ADMIN_EMAIL = "adamakane707@gmail.com";

// Petite alerte sonore (bip court généré via WebAudio, aucun fichier requis)
function playBeep() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.15;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.stop(ctx.currentTime + 0.45);
  } catch {}
}

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Tableau de suivi — NAYORA TEXTILE" }] }),
});

type Quote = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  fabric: string | null;
  color: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

const STATUSES = [
  { v: "nouveau", label: "Nouveau", cls: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  { v: "en_cours", label: "En cours", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  { v: "traite", label: "Traité", cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  { v: "annule", label: "Annulé", cls: "bg-red-500/15 text-red-700 border-red-500/30" },
];

function AdminPage() {
  const navigate = useNavigate();
  const list = useServerFn(listQuoteRequests);
  const update = useServerFn(updateQuoteRequest);
  const remove = useServerFn(deleteQuoteRequest);
  const check = useServerFn(checkIsAdmin);

  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("tous");
  const [notifEnabled, setNotifEnabled] = useState<boolean>(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );
  const [isAdmin, setIsAdmin] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/login" });
        return;
      }
      const admin = await check();
      if (!admin.isAdmin) {
        setError("Votre compte n'a pas encore les droits administrateur. Contactez le support pour activer votre accès.");
        setQuotes([]);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      const res = await list();
      setQuotes(res.quotes as Quote[]);
    } catch (e: any) {
      setError(e?.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [list, check, navigate]);

  useEffect(() => { load(); }, [load]);

  // Realtime : nouvelles demandes de devis
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-quotes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "quote_requests" },
        (payload) => {
          const q = payload.new as Quote;
          setQuotes((prev) => [q, ...prev]);
          playBeep();
          toast.success(`Nouvelle demande de ${q.name}`, {
            description: `${q.fabric ?? "Tissu non précisé"} • ${q.phone}`,
            duration: 8000,
          });
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              const n = new Notification("NAYORA — Nouvelle demande de devis", {
                body: `${q.name} • ${q.phone}${q.fabric ? ` • ${q.fabric}` : ""}`,
                tag: q.id,
              });
              n.onclick = () => { window.focus(); };
            } catch {}
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Votre navigateur ne supporte pas les notifications");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifEnabled(true);
      toast.success("Notifications activées");
      playBeep();
    } else {
      toast.error("Notifications refusées");
    }
  };

  const onStatus = async (id: string, status: string) => {
    setQuotes(qs => qs.map(q => q.id === id ? { ...q, status } : q));
    await update({ data: { id, status: status as any } });
  };
  const onNotes = async (id: string, admin_notes: string) => {
    await update({ data: { id, admin_notes } });
  };
  const onDelete = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    setQuotes(qs => qs.filter(q => q.id !== id));
    await remove({ data: { id } });
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const filtered = filter === "tous" ? quotes : quotes.filter(q => q.status === filter);
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s.v]: quotes.filter(q => q.status === s.v).length }), {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-gold" />
            <div>
              <div className="font-serif text-lg">NAYORA TEXTILE</div>
              <div className="text-[10px] tracking-[0.3em] text-gold uppercase">Suivi des demandes</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={load} className="px-3 py-2 text-sm rounded-lg border border-gold/40 hover:bg-gold/10 inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Actualiser
            </button>
            <button onClick={signOut} className="px-3 py-2 text-sm rounded-lg border border-gold/40 hover:bg-gold/10 inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-card border border-destructive/40 text-center">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setFilter("tous")}
                      className={`px-4 py-2 rounded-full text-sm border transition ${filter === "tous" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-gold/60"}`}>
                Toutes ({quotes.length})
              </button>
              {STATUSES.map(s => (
                <button key={s.v} onClick={() => setFilter(s.v)}
                        className={`px-4 py-2 rounded-full text-sm border transition ${filter === s.v ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-gold/60"}`}>
                  {s.label} ({counts[s.v] || 0})
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground">Aucune demande pour ce filtre.</p>
            ) : (
              <div className="grid gap-4">
                {filtered.map(q => {
                  const status = STATUSES.find(s => s.v === q.status) ?? STATUSES[0];
                  const phoneClean = q.phone.replace(/[^\d+]/g, "");
                  const waText = encodeURIComponent(`Bonjour ${q.name}, NAYORA TEXTILE — au sujet de votre demande${q.fabric ? ` (${q.fabric})` : ""}.`);
                  return (
                    <article key={q.id} className="p-5 rounded-2xl bg-card border border-border">
                      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-serif text-lg text-primary">{q.name}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(q.created_at).toLocaleString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${phoneClean}`} title="Appeler"
                             className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                            <Phone className="h-4 w-4" />
                          </a>
                          <a href={`https://wa.me/${phoneClean.replace("+","")}?text=${waText}`} target="_blank" rel="noreferrer" title="WhatsApp"
                             className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                          {q.email && (
                            <a href={`mailto:${q.email}`} title="Email"
                               className="w-9 h-9 rounded-full bg-gold text-primary flex items-center justify-center hover:bg-gold-soft">
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          <button onClick={() => onDelete(q.id)} title="Supprimer"
                                  className="w-9 h-9 rounded-full border border-destructive/40 text-destructive flex items-center justify-center hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-4 gap-3 text-sm mb-3">
                        <div><span className="text-muted-foreground">Tél :</span> {q.phone}</div>
                        {q.email && <div className="truncate"><span className="text-muted-foreground">Email :</span> {q.email}</div>}
                        {q.fabric && <div><span className="text-muted-foreground">Tissu :</span> {q.fabric}</div>}
                        {q.color && <div><span className="text-muted-foreground">Couleur :</span> {q.color}</div>}
                      </div>

                      {q.message && (
                        <p className="text-sm bg-muted/50 p-3 rounded-lg mb-3 whitespace-pre-wrap">{q.message}</p>
                      )}

                      <div className="grid sm:grid-cols-[180px_1fr] gap-3">
                        <select value={q.status} onChange={e => onStatus(q.id, e.target.value)}
                                className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                          {STATUSES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                        </select>
                        <input
                          defaultValue={q.admin_notes ?? ""}
                          onBlur={e => onNotes(q.id, e.target.value)}
                          placeholder="Note interne (sauvegarde auto)…"
                          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
