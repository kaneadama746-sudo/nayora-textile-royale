import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  listQuoteRequests, updateQuoteRequest, deleteQuoteRequest, checkIsAdmin,
} from "@/lib/quotes.functions";
import {
  adminListAll,
  upsertCategory, deleteCategory,
  upsertColor, deleteColor,
  upsertFabric, deleteFabric,
  updateSetting,
} from "@/lib/catalog.functions";
import {
  Crown, Loader2, LogOut, Phone, Mail, MessageCircle, Trash2, RefreshCw, Bell, BellOff,
  Plus, Save, Pencil, Tags, Palette, Shirt, Settings,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — NAYORA" }] }),
});

function playBeep() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine"; o.frequency.value = 880; g.gain.value = 0.15;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    o.stop(ctx.currentTime + 0.45);
  } catch {}
}

type Quote = { id: string; name: string; phone: string; email: string | null; fabric: string | null; color: string | null; message: string | null; status: string; admin_notes: string | null; created_at: string; };
type Category = { id: string; name: string; slug: string; description: string | null; position: number };
type Color = { id: string; name: string; hex: string; position: number };
type Fabric = { id: string; name: string; description: string | null; image_url: string | null; price: string | null; category_id: string | null; colors: string[]; position: number; active: boolean };

const STATUSES = [
  { v: "nouveau", label: "Nouveau", cls: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  { v: "en_cours", label: "En cours", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  { v: "traite", label: "Traité", cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  { v: "annule", label: "Annulé", cls: "bg-red-500/15 text-red-700 border-red-500/30" },
];

type Tab = "quotes" | "categories" | "colors" | "fabrics" | "settings";

function AdminPage() {
  const navigate = useNavigate();
  const list = useServerFn(listQuoteRequests);
  const update = useServerFn(updateQuoteRequest);
  const remove = useServerFn(deleteQuoteRequest);
  const check = useServerFn(checkIsAdmin);
  const loadCatalog = useServerFn(adminListAll);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("quotes");

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filter, setFilter] = useState<string>("tous");

  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});

  const [notifEnabled, setNotifEnabled] = useState<boolean>(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      const admin = await check();
      if (!admin.isAdmin) {
        setError("Votre compte n'a pas encore les droits administrateur."); setQuotes([]); setIsAdmin(false); return;
      }
      setIsAdmin(true);
      const [q, cat] = await Promise.all([list(), loadCatalog()]);
      setQuotes(q.quotes as Quote[]);
      setCategories(cat.categories as Category[]);
      setColors(cat.colors as Color[]);
      setFabrics(cat.fabrics as Fabric[]);
      setSettings(cat.settings);
    } catch (e: any) {
      setError(e?.message ?? "Erreur de chargement");
    } finally { setLoading(false); }
  }, [list, check, loadCatalog, navigate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase.channel("admin-quotes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "quote_requests" },
        (payload) => {
          const q = payload.new as Quote;
          setQuotes((prev) => [q, ...prev]);
          playBeep();
          toast.success(`Nouvelle demande de ${q.name}`, {
            description: `${q.fabric ?? "Tissu non précisé"} • ${q.phone}`, duration: 8000,
          });
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              const n = new Notification("NAYORA — Nouvelle demande", {
                body: `${q.name} • ${q.phone}${q.fabric ? ` • ${q.fabric}` : ""}`, tag: q.id,
              });
              n.onclick = () => { window.focus(); };
            } catch {}
          }
        }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) { toast.error("Navigateur non supporté"); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") { setNotifEnabled(true); toast.success("Notifications activées"); playBeep(); }
    else toast.error("Notifications refusées");
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); };

  const TABS: { v: Tab; label: string; icon: any }[] = [
    { v: "quotes", label: "Demandes", icon: MessageCircle },
    { v: "categories", label: "Catégories", icon: Tags },
    { v: "colors", label: "Couleurs", icon: Palette },
    { v: "fabrics", label: "Tissus", icon: Shirt },
    { v: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <Link to="/" className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-gold" />
            <div>
              <div className="font-serif text-lg">NAYORA</div>
              <div className="text-[10px] tracking-[0.3em] text-gold uppercase">Administration</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={requestNotifPermission}
              className={`px-3 py-2 text-sm rounded-lg border inline-flex items-center gap-2 ${notifEnabled ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100" : "border-gold/40 hover:bg-gold/10"}`}>
              {notifEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              <span className="hidden sm:inline">{notifEnabled ? "Notifs ON" : "Activer notifs"}</span>
            </button>
            <button onClick={load} className="px-3 py-2 text-sm rounded-lg border border-gold/40 hover:bg-gold/10 inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> <span className="hidden sm:inline">Actualiser</span>
            </button>
            <button onClick={signOut} className="px-3 py-2 text-sm rounded-lg border border-gold/40 hover:bg-gold/10 inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
        {isAdmin && (
          <div className="max-w-7xl mx-auto px-6 pb-3 flex flex-wrap gap-1">
            {TABS.map(t => (
              <button key={t.v} onClick={() => setTab(t.v)}
                className={`px-4 py-2 text-sm rounded-t-lg inline-flex items-center gap-2 transition ${tab === t.v ? "bg-muted/30 text-primary" : "text-primary-foreground/80 hover:bg-white/10"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        )}
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
            {tab === "quotes" && (
              <QuotesTab quotes={quotes} setQuotes={setQuotes} filter={filter} setFilter={setFilter}
                update={update} remove={remove} />
            )}
            {tab === "categories" && (
              <CategoriesTab items={categories} reload={load} />
            )}
            {tab === "colors" && (
              <ColorsTab items={colors} reload={load} />
            )}
            {tab === "fabrics" && (
              <FabricsTab items={fabrics} categories={categories} colorsList={colors} reload={load} />
            )}
            {tab === "settings" && (
              <SettingsTab settings={settings} reload={load} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ============ QUOTES TAB ============
function QuotesTab({ quotes, setQuotes, filter, setFilter, update, remove }: any) {
  const onStatus = async (id: string, status: string) => {
    setQuotes((qs: Quote[]) => qs.map(q => q.id === id ? { ...q, status } : q));
    await update({ data: { id, status } });
  };
  const onNotes = async (id: string, admin_notes: string) => {
    await update({ data: { id, admin_notes } });
  };
  const onDelete = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    setQuotes((qs: Quote[]) => qs.filter(q => q.id !== id));
    await remove({ data: { id } });
  };
  const filtered = filter === "tous" ? quotes : quotes.filter((q: Quote) => q.status === filter);
  const counts = STATUSES.reduce((acc: any, s) => ({ ...acc, [s.v]: quotes.filter((q: Quote) => q.status === s.v).length }), {});

  return (
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
          {filtered.map((q: Quote) => {
            const status = STATUSES.find(s => s.v === q.status) ?? STATUSES[0];
            const phoneClean = q.phone.replace(/[^\d+]/g, "");
            const waText = encodeURIComponent(`Bonjour ${q.name}, NAYORA — au sujet de votre demande${q.fabric ? ` (${q.fabric})` : ""}.`);
            return (
              <article key={q.id} className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-serif text-lg text-primary">{q.name}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(q.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${phoneClean}`} title="Appeler" className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"><Phone className="h-4 w-4" /></a>
                    <a href={`https://wa.me/${phoneClean.replace("+", "")}?text=${waText}`} target="_blank" rel="noreferrer" title="WhatsApp" className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700"><MessageCircle className="h-4 w-4" /></a>
                    {q.email && <a href={`mailto:${q.email}`} title="Email" className="w-9 h-9 rounded-full bg-gold text-primary flex items-center justify-center hover:bg-gold-soft"><Mail className="h-4 w-4" /></a>}
                    <button onClick={() => onDelete(q.id)} title="Supprimer" className="w-9 h-9 rounded-full border border-destructive/40 text-destructive flex items-center justify-center hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-4 gap-3 text-sm mb-3">
                  <div><span className="text-muted-foreground">Tél :</span> {q.phone}</div>
                  {q.email && <div className="truncate"><span className="text-muted-foreground">Email :</span> {q.email}</div>}
                  {q.fabric && <div><span className="text-muted-foreground">Tissu :</span> {q.fabric}</div>}
                  {q.color && <div><span className="text-muted-foreground">Couleur :</span> {q.color}</div>}
                </div>
                {q.message && <p className="text-sm bg-muted/50 p-3 rounded-lg mb-3 whitespace-pre-wrap">{q.message}</p>}
                <div className="grid sm:grid-cols-[180px_1fr] gap-3">
                  <select value={q.status} onChange={e => onStatus(q.id, e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {STATUSES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
                  </select>
                  <input defaultValue={q.admin_notes ?? ""} onBlur={e => onNotes(q.id, e.target.value)}
                    placeholder="Note interne (sauvegarde auto)…" className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

// ============ CATEGORIES TAB ============
function CategoriesTab({ items, reload }: { items: Category[]; reload: () => void }) {
  const save = useServerFn(upsertCategory);
  const del = useServerFn(deleteCategory);
  const [draft, setDraft] = useState<Partial<Category>>({ name: "", slug: "", description: "", position: 0 });
  const [editing, setEditing] = useState<string | null>(null);

  const onSave = async (data: Partial<Category>) => {
    try {
      await save({ data: { ...data, position: Number(data.position) || 0 } as any });
      toast.success("Catégorie enregistrée"); setDraft({ name: "", slug: "", description: "", position: 0 }); setEditing(null); reload();
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); }
  };
  const onDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ? Les tissus associés ne seront plus catégorisés.")) return;
    try { await del({ data: { id } }); toast.success("Supprimée"); reload(); } catch (e: any) { toast.error(e?.message); }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-card border border-border">
        <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Nouvelle catégorie</h3>
        <div className="grid sm:grid-cols-4 gap-3">
          <input placeholder="Nom (ex: Wax)" value={draft.name ?? ""} onChange={e => setDraft({ ...draft, name: e.target.value, slug: draft.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <input placeholder="slug (ex: wax)" value={draft.slug ?? ""} onChange={e => setDraft({ ...draft, slug: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <input type="number" placeholder="Ordre" value={draft.position ?? 0} onChange={e => setDraft({ ...draft, position: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <button onClick={() => onSave(draft)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 hover:bg-primary/90"><Save className="h-4 w-4" /> Ajouter</button>
        </div>
        <textarea placeholder="Description (optionnel)" value={draft.description ?? ""} onChange={e => setDraft({ ...draft, description: e.target.value })} className="mt-3 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={2} />
      </div>

      <div className="grid gap-3">
        {items.map(c => editing === c.id ? (
          <EditCategoryRow key={c.id} cat={c} onSave={(d) => onSave(d)} onCancel={() => setEditing(null)} />
        ) : (
          <div key={c.id} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2"><span className="font-serif text-primary">{c.name}</span><span className="text-xs text-muted-foreground">/{c.slug}</span><span className="text-xs text-muted-foreground">#{c.position}</span></div>
              {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c.id)} className="px-3 py-1.5 rounded-lg border border-input text-sm inline-flex items-center gap-1"><Pencil className="h-3.5 w-3.5" /> Modifier</button>
              <button onClick={() => onDelete(c.id)} className="px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-sm inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Suppr.</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function EditCategoryRow({ cat, onSave, onCancel }: any) {
  const [d, setD] = useState<Category>(cat);
  return (
    <div className="p-4 rounded-xl bg-card border border-gold/50">
      <div className="grid sm:grid-cols-4 gap-3 mb-3">
        <input value={d.name} onChange={e => setD({ ...d, name: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <input value={d.slug} onChange={e => setD({ ...d, slug: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <input type="number" value={d.position} onChange={e => setD({ ...d, position: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <div className="flex gap-2">
          <button onClick={() => onSave(d)} className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center gap-1"><Save className="h-4 w-4" /> Sauver</button>
          <button onClick={onCancel} className="px-3 py-2 rounded-lg border border-input">Annuler</button>
        </div>
      </div>
      <textarea value={d.description ?? ""} onChange={e => setD({ ...d, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
    </div>
  );
}

// ============ COLORS TAB ============
function ColorsTab({ items, reload }: { items: Color[]; reload: () => void }) {
  const save = useServerFn(upsertColor);
  const del = useServerFn(deleteColor);
  const [draft, setDraft] = useState<Partial<Color>>({ name: "", hex: "#000000", position: 0 });
  const [editing, setEditing] = useState<string | null>(null);

  const onSave = async (data: Partial<Color>) => {
    try { await save({ data: { ...data, position: Number(data.position) || 0 } as any }); toast.success("Couleur enregistrée"); setDraft({ name: "", hex: "#000000", position: 0 }); setEditing(null); reload(); }
    catch (e: any) { toast.error(e?.message); }
  };
  const onDelete = async (id: string) => {
    if (!confirm("Supprimer cette couleur ?")) return;
    try { await del({ data: { id } }); toast.success("Supprimée"); reload(); } catch (e: any) { toast.error(e?.message); }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-card border border-border">
        <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> Nouvelle couleur</h3>
        <div className="grid sm:grid-cols-4 gap-3">
          <input placeholder="Nom (ex: Bleu nuit)" value={draft.name ?? ""} onChange={e => setDraft({ ...draft, name: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <div className="flex gap-2">
            <input type="color" value={draft.hex ?? "#000000"} onChange={e => setDraft({ ...draft, hex: e.target.value })} className="w-12 h-9 rounded border border-input" />
            <input placeholder="#RRGGBB" value={draft.hex ?? ""} onChange={e => setDraft({ ...draft, hex: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          </div>
          <input type="number" placeholder="Ordre" value={draft.position ?? 0} onChange={e => setDraft({ ...draft, position: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <button onClick={() => onSave(draft)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center gap-2"><Save className="h-4 w-4" /> Ajouter</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(c => editing === c.id ? (
          <EditColorRow key={c.id} col={c} onSave={(d: any) => onSave(d)} onCancel={() => setEditing(null)} />
        ) : (
          <div key={c.id} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full ring-1 ring-border" style={{ backgroundColor: c.hex }} />
              <div>
                <div className="font-medium text-primary">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.hex} · #{c.position}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c.id)} className="px-3 py-1.5 rounded-lg border border-input text-sm"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDelete(c.id)} className="px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-sm"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function EditColorRow({ col, onSave, onCancel }: any) {
  const [d, setD] = useState<Color>(col);
  return (
    <div className="p-4 rounded-xl bg-card border border-gold/50">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={d.name} onChange={e => setD({ ...d, name: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <div className="flex gap-2">
          <input type="color" value={d.hex} onChange={e => setD({ ...d, hex: e.target.value })} className="w-10 h-9 rounded border border-input" />
          <input value={d.hex} onChange={e => setD({ ...d, hex: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <input type="number" value={d.position} onChange={e => setD({ ...d, position: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <div className="flex gap-2">
          <button onClick={() => onSave(d)} className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground"><Save className="h-4 w-4 inline" /></button>
          <button onClick={onCancel} className="px-3 py-2 rounded-lg border border-input">×</button>
        </div>
      </div>
    </div>
  );
}

// ============ FABRICS TAB ============
function FabricsTab({ items, categories, colorsList, reload }: { items: Fabric[]; categories: Category[]; colorsList: Color[]; reload: () => void }) {
  const save = useServerFn(upsertFabric);
  const del = useServerFn(deleteFabric);
  const empty: Partial<Fabric> = { name: "", description: "", image_url: "", price: "", category_id: categories[0]?.id ?? null, colors: [], position: 0, active: true };
  const [draft, setDraft] = useState<Partial<Fabric>>(empty);
  const [editing, setEditing] = useState<string | null>(null);

  const onSave = async (data: Partial<Fabric>) => {
    try {
      await save({ data: {
        ...data,
        position: Number(data.position) || 0,
        active: data.active !== false,
        colors: data.colors ?? [],
        image_url: data.image_url || null,
        price: data.price || null,
        description: data.description || null,
        category_id: data.category_id || null,
      } as any });
      toast.success("Tissu enregistré"); setDraft(empty); setEditing(null); reload();
    } catch (e: any) { toast.error(e?.message); }
  };
  const onDelete = async (id: string) => {
    if (!confirm("Supprimer ce tissu ?")) return;
    try { await del({ data: { id } }); toast.success("Supprimé"); reload(); } catch (e: any) { toast.error(e?.message); }
  };

  return (
    <div className="space-y-6">
      <FabricForm title="Nouveau tissu" data={draft} setData={setDraft} categories={categories} colorsList={colorsList} onSave={() => onSave(draft)} />
      <div className="grid gap-3">
        {items.map(f => editing === f.id ? (
          <EditFabricRow key={f.id} fab={f} categories={categories} colorsList={colorsList} onSave={onSave} onCancel={() => setEditing(null)} />
        ) : (
          <div key={f.id} className="p-4 rounded-xl bg-card border border-border flex items-center gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
              {f.image_url && <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif text-primary">{f.name}</span>
                {!f.active && <span className="text-xs px-2 py-0.5 rounded-full bg-muted">Inactif</span>}
                <span className="text-xs text-muted-foreground">#{f.position}</span>
                <span className="text-xs text-muted-foreground">{categories.find(c => c.id === f.category_id)?.name ?? "—"}</span>
              </div>
              {f.description && <p className="text-sm text-muted-foreground line-clamp-1">{f.description}</p>}
              <div className="flex gap-1 mt-1">{f.colors.slice(0, 8).map(cn => {
                const hex = colorsList.find(c => c.name === cn)?.hex ?? "#ccc";
                return <span key={cn} title={cn} className="h-3 w-3 rounded-full ring-1 ring-border" style={{ backgroundColor: hex }} />;
              })}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(f.id)} className="px-3 py-1.5 rounded-lg border border-input text-sm inline-flex items-center gap-1"><Pencil className="h-3.5 w-3.5" /> Modifier</button>
              <button onClick={() => onDelete(f.id)} className="px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-sm"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function FabricForm({ title, data, setData, categories, colorsList, onSave }: any) {
  const toggleColor = (name: string) => {
    const current: string[] = data.colors ?? [];
    setData({ ...data, colors: current.includes(name) ? current.filter(c => c !== name) : [...current, name] });
  };
  return (
    <div className="p-5 rounded-2xl bg-card border border-border">
      <h3 className="font-serif text-lg text-primary mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> {title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <input placeholder="Nom du tissu" value={data.name ?? ""} onChange={e => setData({ ...data, name: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <select value={data.category_id ?? ""} onChange={e => setData({ ...data, category_id: e.target.value || null })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
          <option value="">— Catégorie —</option>
          {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="URL image (https://...)" value={data.image_url ?? ""} onChange={e => setData({ ...data, image_url: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <input placeholder="Prix (ex: 5000 FCFA/m)" value={data.price ?? ""} onChange={e => setData({ ...data, price: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <input type="number" placeholder="Ordre" value={data.position ?? 0} onChange={e => setData({ ...data, position: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.active !== false} onChange={e => setData({ ...data, active: e.target.checked })} /> Actif (visible sur le site)</label>
      </div>
      <textarea placeholder="Description" rows={2} value={data.description ?? ""} onChange={e => setData({ ...data, description: e.target.value })} className="mt-3 w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
      <p className="text-xs text-muted-foreground mt-3 mb-2">Couleurs disponibles :</p>
      <div className="flex flex-wrap gap-2">
        {colorsList.map((col: Color) => {
          const active = (data.colors ?? []).includes(col.name);
          return (
            <button type="button" key={col.id} onClick={() => toggleColor(col.name)}
              className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-xs transition ${active ? "border-gold bg-gold/10" : "border-border hover:border-gold/60"}`}>
              <span className="h-4 w-4 rounded-full ring-1 ring-border" style={{ backgroundColor: col.hex }} />
              {col.name}
            </button>
          );
        })}
      </div>
      <button onClick={onSave} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-2"><Save className="h-4 w-4" /> Enregistrer</button>
    </div>
  );
}
function EditFabricRow({ fab, categories, colorsList, onSave, onCancel }: any) {
  const [d, setD] = useState<Fabric>(fab);
  return (
    <div className="border border-gold/50 rounded-2xl">
      <FabricForm title="Modifier le tissu" data={d} setData={setD} categories={categories} colorsList={colorsList} onSave={() => onSave(d).then(onCancel)} />
      <div className="px-5 pb-4"><button onClick={onCancel} className="text-sm text-muted-foreground hover:underline">Annuler</button></div>
    </div>
  );
}

// ============ SETTINGS TAB ============
function SettingsTab({ settings, reload }: { settings: Record<string, any>; reload: () => void }) {
  const save = useServerFn(updateSetting);
  const [site, setSite] = useState<any>(settings.site ?? {});
  const [contact, setContact] = useState<any>(settings.contact ?? {});

  useEffect(() => { setSite(settings.site ?? {}); setContact(settings.contact ?? {}); }, [settings]);

  const saveSite = async () => {
    try { await save({ data: { key: "site", value: site } }); toast.success("Infos site sauvées"); reload(); }
    catch (e: any) { toast.error(e?.message); }
  };
  const saveContact = async () => {
    try {
      const phones = (contact.phonesRaw ?? (contact.phones ?? []).join("\n")).split("\n").map((s: string) => s.trim()).filter(Boolean);
      const phoneLabels = (contact.phoneLabelsRaw ?? (contact.phoneLabels ?? []).join("\n")).split("\n").map((s: string) => s.trim()).filter(Boolean);
      const payload = { ...contact, phones, phoneLabels };
      delete payload.phonesRaw; delete payload.phoneLabelsRaw;
      await save({ data: { key: "contact", value: payload } }); toast.success("Contact sauvé"); reload();
    } catch (e: any) { toast.error(e?.message); }
  };

  const Field = ({ label, value, onChange, textarea = false }: any) => (
    <label className="block">
      <span className="block text-xs text-muted-foreground mb-1">{label}</span>
      {textarea
        ? <textarea rows={3} value={value ?? ""} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        : <input value={value ?? ""} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
      }
    </label>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
        <h3 className="font-serif text-lg text-primary">Identité du site</h3>
        <Field label="Nom" value={site.name} onChange={(v: string) => setSite({ ...site, name: v })} />
        <Field label="Tagline (sous le titre hero)" value={site.tagline} onChange={(v: string) => setSite({ ...site, tagline: v })} />
        <Field label="Titre hero (1ère ligne)" value={site.heroTitle} onChange={(v: string) => setSite({ ...site, heroTitle: v })} />
        <Field label="Titre hero (accent doré)" value={site.heroAccent} onChange={(v: string) => setSite({ ...site, heroAccent: v })} />
        <Field label="Description hero" value={site.heroDesc} onChange={(v: string) => setSite({ ...site, heroDesc: v })} textarea />
        <Field label="Titre À propos" value={site.aboutTitle} onChange={(v: string) => setSite({ ...site, aboutTitle: v })} />
        <Field label="Texte À propos" value={site.aboutText} onChange={(v: string) => setSite({ ...site, aboutText: v })} textarea />
        <button onClick={saveSite} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center gap-2"><Save className="h-4 w-4" /> Enregistrer</button>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
        <h3 className="font-serif text-lg text-primary">Coordonnées</h3>
        <Field label="Adresse" value={contact.address} onChange={(v: string) => setContact({ ...contact, address: v })} />
        <Field label="Email" value={contact.email} onChange={(v: string) => setContact({ ...contact, email: v })} />
        <Field label="Téléphones (un par ligne, format international ex: +221787945050)"
          value={contact.phonesRaw ?? (contact.phones ?? []).join("\n")}
          onChange={(v: string) => setContact({ ...contact, phonesRaw: v })} textarea />
        <Field label="Libellés téléphone (un par ligne, ex: 78 794 50 50)"
          value={contact.phoneLabelsRaw ?? (contact.phoneLabels ?? []).join("\n")}
          onChange={(v: string) => setContact({ ...contact, phoneLabelsRaw: v })} textarea />
        <Field label="Instagram (URL complète)" value={contact.instagram} onChange={(v: string) => setContact({ ...contact, instagram: v })} />
        <button onClick={saveContact} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center gap-2"><Save className="h-4 w-4" /> Enregistrer</button>
      </div>
    </div>
  );
}
