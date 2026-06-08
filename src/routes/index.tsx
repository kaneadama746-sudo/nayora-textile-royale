import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Crown, MapPin, Phone, Mail, Sparkles, Scissors, Truck, ShieldCheck, Instagram, MessageCircle, X, Loader2, CheckCircle2 } from "lucide-react";
import { submitQuoteRequest } from "@/lib/quotes.functions";
import { getCatalog } from "@/lib/catalog.functions";
import logo from "@/assets/nayora-logo.jpg";
import hero from "@/assets/hero-fabrics.jpg";
import waxHollandaise from "@/assets/wax-hollandaise.jpg";
import waxHittaguet from "@/assets/wax-hittaguet.jpg";
import mazinGold from "@/assets/mazin-gold.jpg";
import brode from "@/assets/brode.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "NAYORA — L'excellence textile pour toutes vos exigences" },
      { name: "description", content: "NAYORA, votre référence en tissus à Dakar : Wax, Bazin Riche, Bazin Gold VIP, Brodés. Marché HLM 5, Sénégal." },
    ],
  }),
});

const FALLBACK_IMG: Record<string, string> = {
  "Wax Hittaguet": waxHittaguet,
  "Wax Hollandaise": waxHollandaise,
  "Bazin Riche": mazinGold,
  "Bazin Gold VIP": mazinGold,
  "Bazin Simple": mazinGold,
  "Brodé Simple": brode,
  "Brodé Unisexe": brode,
  "Brodé de la Mode": brode,
};
function fabricImg(name: string, url?: string | null) {
  if (url && url.trim()) return url;
  return FALLBACK_IMG[name] ?? hero;
}

const features = [
  { icon: Sparkles, title: "Qualité Premium", desc: "Tissus sélectionnés avec soin auprès des meilleurs fournisseurs." },
  { icon: Scissors, title: "Vente en gros & détail", desc: "Du coupon unique à la pièce entière pour les couturiers." },
  { icon: Truck, title: "Livraison Sénégal & Afrique", desc: "Nous expédions partout au Sénégal et à travers l'Afrique." },
  { icon: ShieldCheck, title: "Authenticité garantie", desc: "Wax, Bazin et Brodés certifiés d'origine." },
];

type Category = { id: string; name: string; slug: string };
type Color = { id: string; name: string; hex: string };
type Fabric = { id: string; name: string; description: string | null; image_url: string | null; price: string | null; category_id: string | null; colors: string[] };

function Index() {
  const fetchCatalog = useServerFn(getCatalog);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchCatalog().then((res: any) => {
      setCategories(res.categories);
      setColors(res.colors);
      setFabrics(res.fabrics);
      setSettings(res.settings);
    }).catch(() => {});
  }, [fetchCatalog]);

  const site = settings.site ?? {};
  const contact = settings.contact ?? {};
  const siteName = site.name ?? "NAYORA";
  const tagline = site.tagline ?? "Maison de Tissus · Dakar";
  const heroTitle = site.heroTitle ?? "L'excellence textile";
  const heroAccent = site.heroAccent ?? "pour toutes vos exigences";
  const heroDesc = site.heroDesc ?? "NAYORA vous propose une sélection raffinée de Wax, Bazin et Brodés.";
  const aboutTitle = site.aboutTitle ?? "La maison de référence du textile à Dakar";
  const aboutText = site.aboutText ?? "Implantée au cœur du Marché HLM 5, NAYORA incarne l'élégance et la qualité.";
  const phones: string[] = contact.phones ?? ["+221787945050", "+221787974040"];
  const phoneLabels: string[] = contact.phoneLabels ?? ["78 794 50 50", "78 797 40 40"];
  const email: string = contact.email ?? "nayora797@gmail.com";
  const address: string = contact.address ?? "Marché HLM 5, Dakar — Sénégal";
  const instagram: string = contact.instagram ?? "";

  const phoneClean = (phones[0] ?? "+221787945050").replace(/[^\d+]/g, "");
  const whatsapp = `https://wa.me/${phoneClean.replace("+", "")}`;
  const waUrl = (phone: string, text?: string) =>
    `https://wa.me/${phone.replace(/[^\d]/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  const tel = `tel:${phoneClean}`;
  const mailto = (subject: string, body = "") =>
    `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const colorMap = useMemo(() => Object.fromEntries(colors.map(c => [c.name, c.hex])), [colors]);
  const catById = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories]);

  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const filteredFabrics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fabrics.filter(c =>
      (!colorFilter || c.colors.includes(colorFilter)) &&
      (!categoryFilter || c.category_id === categoryFilter) &&
      (!q || c.name.toLowerCase().includes(q) || (catById[c.category_id ?? ""]?.name.toLowerCase().includes(q)))
    );
  }, [fabrics, colorFilter, categoryFilter, search, catById]);

  const submit = useServerFn(submitQuoteRequest);
  const [form, setForm] = useState({ name: "", phone: "", email: "", fabric: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError(null);
    try {
      await submit({ data: { ...form, color: colorFilter ?? "" } });
      setSent(true);
      setForm({ name: "", phone: "", email: "", fabric: "", message: "" });
    } catch (err: any) {
      setFormError(err?.message ?? "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/90 border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left: logo */}
          <a href="#top" className="flex items-center gap-3">
            <img src={logo} alt={siteName} className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/50" />
            <div className="leading-tight hidden sm:block">
              <div className="font-serif text-xl text-primary tracking-wide">{siteName}</div>
              <div className="text-[10px] tracking-[0.3em] text-gold uppercase">Maison de Tissus</div>
            </div>
          </a>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#collections" className="hover:text-gold transition text-primary">Collections</a>
            <a href="#about" className="hover:text-gold transition text-primary">À propos</a>
            <a href="#contact" className="hover:text-gold transition text-primary">Contact</a>
          </nav>

          {/* Right: quick actions */}
          <div className="flex items-center gap-3 text-sm">
            <a href={whatsapp} target="_blank" rel="noreferrer"
               className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href="#contact"
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition">
              Commander
            </a>
          </div>
        </div>
      </header>

      <section id="top" className="relative min-h-screen flex items-center pt-20 overflow-hidden"
               style={{ background: "var(--gradient-royal)" }}>
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent, oklch(0.21 0.05 260 / 0.7))" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 text-gold text-xs tracking-[0.2em] uppercase mb-8">
              <Crown className="h-3.5 w-3.5" /> {tagline}
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-6">
              {heroTitle}<br/>
              <span style={{ background: "var(--gradient-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {heroAccent}
              </span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl">{heroDesc}</p>
            <div className="flex flex-wrap gap-4">
              <a href="#collections" className="px-8 py-4 rounded-full bg-gold text-primary font-semibold hover:bg-gold-soft transition shadow-[var(--shadow-gold)]">
                Découvrir nos tissus
              </a>
              <a href={whatsapp} target="_blank" rel="noreferrer"
                 className="px-8 py-4 rounded-full border border-gold/50 text-primary-foreground hover:bg-gold/10 transition inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-8 rounded-full" style={{ background: "var(--gradient-gold)", filter: "blur(80px)", opacity: 0.3 }} />
            <img src={logo} alt={`Logo ${siteName}`} className="relative w-full max-w-md mx-auto rounded-3xl shadow-[var(--shadow-royal)] ring-1 ring-gold/30" />
          </div>
        </div>
      </section>

      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Pourquoi {siteName}</p>
            <h2 className="font-serif text-4xl md:text-5xl text-primary">Un savoir-faire d'exception</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-8 rounded-2xl bg-card border border-border hover:border-gold/50 transition hover:shadow-[var(--shadow-gold)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--gradient-gold)" }}>
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="collections" className="py-24 px-6 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Nos Collections</p>
              <h2 className="font-serif text-4xl md:text-5xl text-primary max-w-xl">Une sélection pour chaque occasion</h2>
            </div>
            <p className="max-w-md text-muted-foreground">Du wax éclatant au bazin prestige, découvrez l'essence du textile africain.</p>
          </div>

          {/* Category showcase — gros boutons visuels */}
          <div className="mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-4 text-center">Choisissez votre catégorie préférée</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`group relative overflow-hidden rounded-2xl aspect-[4/3] border-2 transition-all duration-300 ${!categoryFilter ? "border-gold shadow-[var(--shadow-gold)] scale-[1.02]" : "border-border hover:border-gold/60 hover:-translate-y-1"}`}
                style={{ background: "var(--gradient-royal)" }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground p-3">
                  <Crown className="h-7 w-7 mb-2 text-gold" />
                  <div className="font-serif text-lg leading-none">Tous</div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-gold mt-2">{fabrics.length} tissus</div>
                </div>
              </button>
              {categories.map(cat => {
                const catFabrics = fabrics.filter(c => c.category_id === cat.id);
                const active = categoryFilter === cat.id;
                const preview = catFabrics.find(f => f.image_url)?.image_url
                  ?? fabricImg(catFabrics[0]?.name ?? cat.name, catFabrics[0]?.image_url);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(active ? null : cat.id)}
                    className={`group relative overflow-hidden rounded-2xl aspect-[4/3] border-2 transition-all duration-300 ${active ? "border-gold shadow-[var(--shadow-gold)] scale-[1.02]" : "border-border hover:border-gold/60 hover:-translate-y-1"}`}
                  >
                    <img src={preview} alt={cat.name} loading="lazy"
                         className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end text-white p-3 text-center">
                      <div className="font-serif text-lg leading-tight drop-shadow-lg">{cat.name}</div>
                      <div className="text-[11px] tracking-[0.2em] uppercase text-gold mt-1.5">{catFabrics.length} tissus</div>
                    </div>
                    {active && (
                      <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-gold flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6 p-5 rounded-2xl bg-card border border-border">
            <div className="flex flex-wrap items-center gap-3">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un tissu..."
                className="flex-1 min-w-[220px] px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
              {(search || categoryFilter || colorFilter) && (
                <button onClick={() => { setSearch(""); setCategoryFilter(null); setColorFilter(null); }}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-gold transition">
                  <X className="h-4 w-4" /> Tout réinitialiser
                </button>
              )}
            </div>
          </div>


          <div className="mb-10 p-5 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-gold mb-1">Filtrer par couleur</p>
                <p className="text-sm text-muted-foreground">
                  {colorFilter
                    ? <>Tissus disponibles en <span className="font-semibold text-primary">{colorFilter}</span> ({filteredFabrics.length})</>
                    : "Cliquez sur une couleur pour affiner votre recherche"}
                </p>
              </div>
              {colorFilter && (
                <button onClick={() => setColorFilter(null)}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-gold transition">
                  <X className="h-4 w-4" /> Réinitialiser
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {colors.map(color => {
                const active = colorFilter === color.name;
                return (
                  <button key={color.id} onClick={() => setColorFilter(active ? null : color.name)}
                    title={color.name} aria-pressed={active}
                    className={`group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition ${active ? "border-gold bg-gold/10 shadow-[var(--shadow-gold)]" : "border-border hover:border-gold/60 bg-background"}`}>
                    <span className="h-6 w-6 rounded-full ring-1 ring-border" style={{ backgroundColor: color.hex }} />
                    <span className="text-xs font-medium text-primary">{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFabrics.map((c) => {
              const catName = catById[c.category_id ?? ""]?.name;
              const subj = `Demande d'information — ${c.name}${colorFilter ? ` (${colorFilter})` : ""}`;
              const msg = `Bonjour ${siteName}, je souhaite des informations sur ${c.name}${colorFilter ? ` en couleur ${colorFilter}` : ""}.`;
              return (
                <article key={c.id}
                  className="group relative flex flex-col rounded-3xl overflow-hidden bg-card border border-border/70 shadow-sm hover:shadow-[var(--shadow-gold)] hover:border-gold/60 transition-all duration-500 hover:-translate-y-1.5">
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <img src={fabricImg(c.name, c.image_url)} alt={c.name} loading="lazy"
                         className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-[1200ms] ease-out" />
                    {/* Gradient sheen */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0 opacity-90" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                      {catName && (
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] tracking-[0.18em] uppercase font-semibold text-primary shadow-sm">
                          {catName}
                        </span>
                      )}
                      {c.price && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-primary shadow-md"
                              style={{ background: "var(--gradient-gold)" }}>
                          {c.price}
                        </span>
                      )}
                    </div>

                    {/* Bottom title overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <h3 className="font-serif text-xl leading-tight drop-shadow-md">{c.name}</h3>
                      {c.colors.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {c.colors.slice(0, 6).map(cn => (
                            <span key={cn} title={cn}
                              className={`h-4 w-4 rounded-full ring-2 ring-white/80 ${colorFilter === cn ? "scale-125 ring-gold" : ""} transition`}
                              style={{ backgroundColor: colorMap[cn] ?? "#ccc" }} />
                          ))}
                          {c.colors.length > 6 && (
                            <span className="text-[10px] text-white/90 ml-1 self-center">+{c.colors.length - 6}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hover quick-order overlay */}
                    <div className="absolute inset-0 bg-primary/85 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center gap-3 p-4 text-center">
                      <Crown className="h-7 w-7 text-gold" />
                      <p className="text-primary-foreground text-sm font-medium max-w-[220px]">
                        {c.description || "Commandez ou demandez plus d'informations sur ce tissu."}
                      </p>
                      <a href={`${whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer"
                         className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-primary text-xs font-bold uppercase tracking-wider hover:bg-gold-soft transition shadow-lg">
                        <MessageCircle className="h-4 w-4" /> Commander
                      </a>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="p-4 flex items-center justify-between gap-2 bg-card">
                    <a href={`${whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" title="WhatsApp"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <a href={tel} title="Appeler"
                      className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition" aria-label="Appeler">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a href={mailto(subj, msg)} title="Email"
                      className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-gold/60 text-primary hover:bg-gold/10 transition" aria-label="Email">
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
          {filteredFabrics.length === 0 && (
            <p className="text-center text-muted-foreground mt-10">
              Aucun tissu listé — contactez-nous, nous l'avons probablement en stock.
            </p>
          )}
          <p className="text-center text-muted-foreground mt-10 italic">
            Et bien d'autres tissus et coloris disponibles sur demande au marché HLM 5.
          </p>
        </div>
      </section>

      <section id="about" className="py-24 px-6 relative overflow-hidden" style={{ background: "var(--gradient-royal)" }}>
        <div className="max-w-5xl mx-auto text-center text-primary-foreground relative">
          <Crown className="h-12 w-12 text-gold mx-auto mb-6" />
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">À propos de nous</p>
          <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">{aboutTitle}</h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-3xl mx-auto whitespace-pre-wrap">{aboutText}</p>
        </div>
      </section>

      <section id="contact" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Nous trouver</p>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-8">Venez nous rendre visite</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-gold)" }}>
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-primary">Adresse</div>
                  <div className="text-muted-foreground">{address}</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-gold)" }}>
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-primary">Téléphone / WhatsApp</div>
                  <div className="flex flex-col gap-1 mt-1">
                    {phones.map((p, i) => (
                      <div key={p} className="flex items-center gap-2 text-sm">
                        <a href={`tel:${p}`} className="text-muted-foreground hover:text-gold transition">{phoneLabels[i] ?? p}</a>
                        <span className="text-muted-foreground/40">·</span>
                        <a href={waUrl(p, `Bonjour ${siteName}, je souhaite passer une commande.`)} target="_blank" rel="noreferrer"
                           className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <a href={mailto(`Contact ${siteName}`)} className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-gold)" }}>
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-primary">Email</div>
                  <div className="text-muted-foreground group-hover:text-gold transition">{email}</div>
                </div>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={waUrl(phones[0] ?? "", `Bonjour ${siteName}, je souhaite passer une commande.`)} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-[var(--shadow-royal)]">
                <MessageCircle className="h-4 w-4" /> Commander sur WhatsApp
              </a>
              <a href={`tel:${phones[0] ?? ""}`}
                 className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition">
                <Phone className="h-4 w-4" /> Appeler
              </a>
              <a href={mailto(`Commande ${siteName}`)}
                 className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-primary hover:bg-gold-soft transition">
                <Mail className="h-4 w-4" /> Email
              </a>
            </div>
          </div>
          <form onSubmit={onSubmit} className="p-8 rounded-2xl bg-card border border-border space-y-4 shadow-[var(--shadow-gold)]">
            <h3 className="font-serif text-2xl text-primary mb-2">Passer commande / Demande de devis</h3>
            <p className="text-sm text-muted-foreground -mt-2 mb-2">
              Nous vous recontactons rapidement par téléphone, WhatsApp ou email.
            </p>
            {sent ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-primary">Merci ! Votre demande a bien été enregistrée.</p>
                <p className="text-sm text-muted-foreground mt-1">Nous vous contacterons très vite.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm text-gold hover:underline">
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <>
                <input required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                       placeholder="Votre nom" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                <input required type="tel" maxLength={40} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                       placeholder="Téléphone (WhatsApp de préférence)" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                <input type="email" maxLength={255} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                       placeholder="Email (optionnel)" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                <select value={form.fabric} onChange={e => setForm({ ...form, fabric: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background">
                  <option value="">Type de tissu souhaité</option>
                  {fabrics.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="Autre">Autre tissu</option>
                </select>
                <textarea rows={4} maxLength={1500} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                          placeholder="Votre commentaire / commande (quantité, couleur, occasion, etc.)"
                          className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
                {formError && <p className="text-sm text-destructive">{formError}</p>}
                <button type="submit" disabled={sending}
                        className="w-full py-3 rounded-lg bg-gold text-primary font-semibold hover:bg-gold-soft transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Commander / Envoyer la demande
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-6 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-10 w-10 rounded-full ring-1 ring-gold/40" />
            <div>
              <div className="font-serif text-lg">{siteName}</div>
              <div className="text-xs text-gold tracking-[0.2em] uppercase">Excellence · Dakar</div>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/60 italic">"L'excellence textile pour toutes vos exigences"</p>
          <div className="flex items-center gap-3">
            <a href={whatsapp} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center hover:bg-gold/10 transition">
              <MessageCircle className="h-4 w-4 text-gold" />
            </a>
            {instagram && (
              <a href={instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center hover:bg-gold/10 transition">
                <Instagram className="h-4 w-4 text-gold" />
              </a>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 text-xs text-primary-foreground/40 text-center">
          © {new Date().getFullYear()} {siteName}. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
