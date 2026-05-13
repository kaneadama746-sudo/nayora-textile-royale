import { createFileRoute } from "@tanstack/react-router";
import { Crown, MapPin, Phone, Mail, Sparkles, Scissors, Truck, ShieldCheck, Instagram, MessageCircle } from "lucide-react";
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
      { title: "NAYORA TEXTILE — L'excellence textile pour toutes vos exigences" },
      { name: "description", content: "NAYORA TEXTILE, votre référence en tissus à Dakar : Wax, Bazin Riche, Bazin Gold VIP, Brodés. Marché HLM 5, Sénégal." },
    ],
  }),
});

const collections = [
  { name: "Wax Hittaguet", desc: "Tissu wax aux motifs vibrants, parfait pour vos tenues du quotidien.", img: waxHittaguet },
  { name: "Wax Hollandaise", desc: "L'authentique wax hollandais, qualité supérieure et couleurs éclatantes.", img: waxHollandaise },
  { name: "Bazin Riche", desc: "Le tissu noble par excellence, idéal pour les grandes occasions.", img: mazinGold },
  { name: "Bazin Gold VIP", desc: "Notre gamme prestige, brillance et raffinement absolus.", img: mazinGold },
  { name: "Bazin Simple", desc: "Élégance accessible pour toutes vos confections.", img: mazinGold },
  { name: "Brodé Simple", desc: "Broderies fines et délicates, finition soignée.", img: brode },
  { name: "Brodé Unisexe", desc: "Une collection moderne pensée pour homme et femme.", img: brode },
  { name: "Brodé de la Mode", desc: "Les dernières tendances brodées de la saison.", img: brode },
];

const features = [
  { icon: Sparkles, title: "Qualité Premium", desc: "Tissus sélectionnés avec soin auprès des meilleurs fournisseurs." },
  { icon: Scissors, title: "Vente en gros & détail", desc: "Du coupon unique à la pièce entière pour les couturiers." },
  { icon: Truck, title: "Livraison Sénégal & Afrique", desc: "Nous expédions partout au Sénégal et à travers l'Afrique." },
  { icon: ShieldCheck, title: "Authenticité garantie", desc: "Wax, Bazin et Brodés certifiés d'origine." },
];

function Index() {
  const whatsapp = "https://wa.me/221000000000";
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <img src={logo} alt="NAYORA TEXTILE" className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/50" />
            <div className="leading-tight">
              <div className="font-serif text-xl text-primary tracking-wide">NAYORA</div>
              <div className="text-[10px] tracking-[0.3em] text-gold uppercase">Textile</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#collections" className="hover:text-gold transition">Collections</a>
            <a href="#about" className="hover:text-gold transition">À propos</a>
            <a href="#services" className="hover:text-gold transition">Services</a>
            <a href="#contact" className="hover:text-gold transition">Contact</a>
          </nav>
          <a href={whatsapp} target="_blank" rel="noreferrer"
             className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition">
            <MessageCircle className="h-4 w-4" /> Commander
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative min-h-screen flex items-center pt-20 overflow-hidden"
               style={{ background: "var(--gradient-royal)" }}>
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent, oklch(0.21 0.05 260 / 0.7))" }} />
        <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 text-gold text-xs tracking-[0.2em] uppercase mb-8">
              <Crown className="h-3.5 w-3.5" /> Maison de Tissus · Dakar
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-6">
              L'excellence textile<br/>
              <span style={{ background: "var(--gradient-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                pour toutes vos exigences
              </span>
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl">
              NAYORA TEXTILE vous propose une sélection raffinée de Wax, Bazin et Brodés
              pour sublimer chaque occasion. La tradition africaine, magnifiée.
            </p>
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
            <img src={logo} alt="Logo NAYORA TEXTILE" className="relative w-full max-w-md mx-auto rounded-3xl shadow-[var(--shadow-royal)] ring-1 ring-gold/30" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Pourquoi NAYORA</p>
            <h2 className="font-serif text-4xl md:text-5xl text-primary">Un savoir-faire d'exception</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group p-8 rounded-2xl bg-card border border-border hover:border-gold/50 transition hover:shadow-[var(--shadow-gold)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                     style={{ background: "var(--gradient-gold)" }}>
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section id="collections" className="py-24 px-6 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">Nos Collections</p>
              <h2 className="font-serif text-4xl md:text-5xl text-primary max-w-xl">Une sélection pour chaque occasion</h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Du wax éclatant au bazin prestige, découvrez l'essence du textile africain
              dans toutes ses couleurs et finitions.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((c) => (
              <article key={c.name} className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-gold/60 transition hover:-translate-y-1 duration-300">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={c.img} alt={c.name} loading="lazy"
                       className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl text-primary mb-1">{c.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{c.desc}</p>
                  <a href={whatsapp} target="_blank" rel="noreferrer"
                     className="text-sm font-medium text-primary hover:text-gold inline-flex items-center gap-1 transition">
                    Demander un prix →
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-10 italic">
            Et bien d'autres tissus disponibles sur demande au marché HLM 5.
          </p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 relative overflow-hidden" style={{ background: "var(--gradient-royal)" }}>
        <div className="max-w-5xl mx-auto text-center text-primary-foreground relative">
          <Crown className="h-12 w-12 text-gold mx-auto mb-6" />
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">À propos de nous</p>
          <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">
            La maison de référence<br />du textile à Dakar
          </h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-3xl mx-auto">
            Implantée au cœur du Marché HLM 5, NAYORA TEXTILE incarne l'élégance
            et la qualité au service des familles, couturiers et professionnels.
            Nous sélectionnons chaque pièce pour son authenticité, sa tenue et sa beauté,
            afin de répondre aux exigences du marché sénégalais et africain.
          </p>
        </div>
      </section>

      {/* Contact */}
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
                  <div className="text-muted-foreground">Marché HLM 5, Dakar — Sénégal</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-gold)" }}>
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-primary">Téléphone / WhatsApp</div>
                  <div className="text-muted-foreground">+221 — à compléter</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gradient-gold)" }}>
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-primary">Email</div>
                  <div className="text-muted-foreground">contact@nayoratextile.sn</div>
                </div>
              </div>
            </div>
            <a href={whatsapp} target="_blank" rel="noreferrer"
               className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-[var(--shadow-royal)]">
              <MessageCircle className="h-5 w-5" /> Discuter sur WhatsApp
            </a>
          </div>
          <form className="p-8 rounded-2xl bg-card border border-border space-y-4 shadow-[var(--shadow-gold)]"
                onSubmit={(e) => { e.preventDefault(); window.open(whatsapp, "_blank"); }}>
            <h3 className="font-serif text-2xl text-primary mb-2">Demande de devis</h3>
            <input required placeholder="Votre nom" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
            <input required type="tel" placeholder="Téléphone" className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
            <select className="w-full px-4 py-3 rounded-lg border border-input bg-background">
              <option>Type de tissu souhaité</option>
              {collections.map(c => <option key={c.name}>{c.name}</option>)}
              <option>Autre tissu</option>
            </select>
            <textarea rows={4} placeholder="Votre message (quantité, couleur, etc.)"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-background" />
            <button className="w-full py-3 rounded-lg bg-gold text-primary font-semibold hover:bg-gold-soft transition">
              Envoyer la demande
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-10 w-10 rounded-full ring-1 ring-gold/40" />
            <div>
              <div className="font-serif text-lg">NAYORA TEXTILE</div>
              <div className="text-xs text-gold tracking-[0.2em] uppercase">Excellence · Dakar</div>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/60 italic">"L'excellence textile pour toutes vos exigences"</p>
          <div className="flex items-center gap-3">
            <a href={whatsapp} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center hover:bg-gold/10 transition">
              <MessageCircle className="h-4 w-4 text-gold" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center hover:bg-gold/10 transition">
              <Instagram className="h-4 w-4 text-gold" />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 text-xs text-primary-foreground/40 text-center">
          © {new Date().getFullYear()} NAYORA TEXTILE. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
