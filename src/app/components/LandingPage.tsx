import { useState, useEffect, useRef } from "react";
import {
  Trees, Wifi, Coffee, Car, Star, MapPin, Phone, Mail,
  Camera, MessageCircle, ChevronDown, ArrowRight, Shield,
  Users, Leaf, Moon, Sunrise, Wind, Menu, X as XIcon
} from "lucide-react";
import type { Store } from "../store/useStore";

const HERO_IMAGE = "https://images.unsplash.com/photo-1700753146836-7091d0b28635?w=1920&h=1080&fit=crop&auto=format&q=80";
const CANOPY_IMAGE = "https://images.unsplash.com/photo-1777239402643-4b55cb061c0f?w=1400&h=700&fit=crop&auto=format&q=80";
const RIVER_IMAGE = "https://images.unsplash.com/photo-1610413310834-c677f3acf391?w=1200&h=800&fit=crop&auto=format&q=80";
const CABIN_IMAGE = "https://images.unsplash.com/photo-1680703486830-1b5af60635d7?w=800&h=600&fit=crop&auto=format&q=80";

const ROOM_IMAGES: Record<string, string> = {
  CH01: "https://images.unsplash.com/photo-1537622417195-e1ef8ce041e7?w=700&h=480&fit=crop&auto=format&q=80",
  CH03: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=700&h=480&fit=crop&auto=format&q=80",
  SU01: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&h=480&fit=crop&auto=format&q=80",
  ST03: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=700&h=480&fit=crop&auto=format&q=80",
};

const FEATURED_ROOM_IDS = ["CH01", "CH03", "SU01", "ST03"];

const benefits = [
  { icon: Wifi, title: "Wi-Fi de Alta Velocidade", desc: "Conectado mesmo no coração da floresta" },
  { icon: Coffee, title: "Café da Manhã Incluso", desc: "Frutas regionais, pães artesanais e muito mais" },
  { icon: Car, title: "Estacionamento Gratuito", desc: "Espaço seguro e monitorado 24h" },
  { icon: Leaf, title: "Ecoturismo Responsável", desc: "Preservação da biodiversidade amazônica" },
  { icon: Moon, title: "Trilhas Noturnas", desc: "Guias especializados em fauna local" },
  { icon: Sunrise, title: "Observação do Amanhecer", desc: "Vista privilegiada do dossel da floresta" },
];

const testimonials = [
  { name: "Mariana Souza", origin: "São Paulo, SP", rating: 5, text: "Uma experiência transformadora. A Tribo Hospedagem cuida de cada detalhe com carinho imenso. Voltaremos com certeza!" },
  { name: "Ricardo e Carla", origin: "Rio de Janeiro, RJ", rating: 5, text: "Os chalés são incríveis — dormimos ao som da floresta. O café da manhã com frutas amazônicas foi inesquecível." },
  { name: "Thomas Weber", origin: "Berlim, Alemanha", rating: 5, text: "Best eco-lodge experience of my life. The nature, the food, the people — absolutely incredible. 10 out of 10." },
];

interface LandingPageProps {
  store: Store;
  onStartBooking: () => void;
  onAdminAccess: () => void;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} fill="#c4882a" style={{ color: "#c4882a" }} />
      ))}
    </div>
  );
}

export function LandingPage({ store, onStartBooking, onAdminAccess }: LandingPageProps) {
  const { rooms } = store;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [activeSection, setActiveSection] = useState("inicio");

  const heroRef = useRef<HTMLDivElement>(null);
  const roomsRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToSection(id: string) {
    const sectionRefs = {
      inicio: heroRef,
      acomodacoes: roomsRef,
      beneficios: benefitsRef,
      contato: contactRef,
    };
    sectionRefs[id as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
    setMobileMenu(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    onStartBooking();
  }

  const featuredRooms = FEATURED_ROOM_IDS.map(id => rooms.find(r => r.id === id)).filter(Boolean) as typeof rooms;

  const navLinks = [
    { id: "inicio", label: "Início" },
    { id: "acomodacoes", label: "Acomodações" },
    { id: "beneficios", label: "Benefícios" },
    { id: "contato", label: "Contato" },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif", background: "#f7f4ef", color: "#1c1a17" }}>

      {/* ── FIXED HEADER ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(26, 46, 20, 0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(196,136,42,0.2)" : "none",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: 68 }}>
          {/* Logo */}
          <button onClick={() => scrollToSection("inicio")} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#c4882a" }}>
              <Trees size={18} style={{ color: "#1a2e14" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", color: "#f7f4ef", fontSize: "1rem", fontWeight: 600, lineHeight: 1.1 }}>Tribo</div>
              <div style={{ fontSize: "0.6rem", color: "#c4882a", letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1 }}>Hospedagem</div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="transition-colors"
                style={{
                  fontSize: "0.875rem",
                  color: activeSection === id ? "#c4882a" : "rgba(247,244,239,0.85)",
                  fontWeight: activeSection === id ? 500 : 400,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={onStartBooking}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full transition-all"
              style={{ background: "#c4882a", color: "#1a2e14", fontSize: "0.875rem", fontWeight: 600 }}
            >
              Reservar Agora
            </button>

            {/* Admin discrete icon */}
            <button
              onClick={onAdminAccess}
              title="Área Administrativa"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(247,244,239,0.4)" }}
            >
              <Shield size={15} />
            </button>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)} style={{ color: "#f7f4ef", background: "none", border: "none", cursor: "pointer" }}>
              {mobileMenu ? <XIcon size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-3" style={{ background: "rgba(26,46,20,0.98)", borderColor: "rgba(196,136,42,0.2)" }}>
            {navLinks.map(({ id, label }) => (
              <button key={id} onClick={() => scrollToSection(id)} className="text-left py-2" style={{ fontSize: "0.95rem", color: "#f7f4ef", background: "none", border: "none", cursor: "pointer" }}>
                {label}
              </button>
            ))}
            <button onClick={onStartBooking} className="mt-2 py-2.5 rounded-full" style={{ background: "#c4882a", color: "#1a2e14", fontSize: "0.9rem", fontWeight: 600 }}>
              Reservar Agora
            </button>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <div ref={heroRef} className="relative" style={{ height: "100vh", minHeight: 640 }}>
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Tribo Hospedagem — Amazônia"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(20,36,14,0.55) 0%, rgba(20,36,14,0.3) 40%, rgba(20,36,14,0.75) 100%)" }} />
        </div>

        {/* Hero content */}
        <div className="relative h-full flex flex-col items-center justify-center px-6" style={{ paddingTop: 68 }}>
          <div className="text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full" style={{ background: "rgba(196,136,42,0.2)", border: "1px solid rgba(196,136,42,0.4)" }}>
              <MapPin size={13} style={{ color: "#c4882a" }} />
              <span style={{ fontSize: "0.78rem", color: "#d4a84b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Amazônia Brasileira</span>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#f7f4ef", lineHeight: 1.1, fontWeight: 600, marginBottom: 20 }}>
              Sua estadia conectada<br />
              <em style={{ color: "#d4a84b" }}>à natureza</em>
            </h1>

            <p style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "rgba(247,244,239,0.85)", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Descubra a Tribo Hospedagem — onde o conforto se encontra com a floresta amazônica em uma experiência única e inesquecível.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                onClick={onStartBooking}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full transition-all"
                style={{ background: "#c4882a", color: "#1a2e14", fontSize: "1rem", fontWeight: 700 }}
              >
                Reservar Agora <ArrowRight size={18} />
              </button>
              <button
                onClick={() => scrollToSection("acomodacoes")}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full"
                style={{ background: "rgba(247,244,239,0.12)", border: "1.5px solid rgba(247,244,239,0.4)", color: "#f7f4ef", fontSize: "1rem" }}
              >
                Ver Acomodações
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce">
            <ChevronDown size={20} style={{ color: "rgba(247,244,239,0.5)" }} />
          </div>
        </div>
      </div>

      {/* ── QUICK SEARCH BAR ── */}
      <div className="sticky top-[68px] z-40" style={{ background: "#1a2e14", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-44 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(196,136,42,0.25)" }}>
              <span style={{ fontSize: "0.7rem", color: "#c4882a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Check-in</span>
              <input
                type="date"
                value={checkin}
                onChange={e => setCheckin(e.target.value)}
                min="2026-06-04"
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "0.875rem", color: "#f7f4ef", colorScheme: "dark" }}
              />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-44 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(196,136,42,0.25)" }}>
              <span style={{ fontSize: "0.7rem", color: "#c4882a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Check-out</span>
              <input
                type="date"
                value={checkout}
                onChange={e => setCheckout(e.target.value)}
                min={checkin || "2026-06-04"}
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "0.875rem", color: "#f7f4ef", colorScheme: "dark" }}
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(196,136,42,0.25)", minWidth: 140 }}>
              <Users size={14} style={{ color: "#c4882a", flexShrink: 0 }} />
              <span style={{ fontSize: "0.7rem", color: "#c4882a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Hóspedes</span>
              <select
                value={guestCount}
                onChange={e => setGuestCount(e.target.value)}
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "0.875rem", color: "#f7f4ef", colorScheme: "dark", cursor: "pointer" }}
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: "#1a2e14" }}>{n} hóspede{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all"
              style={{ background: "#c4882a", color: "#1a2e14", fontSize: "0.9rem", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Buscar Disponibilidade
            </button>
          </form>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ background: "#f0ead8", borderBottom: "1px solid rgba(44,35,18,0.1)" }}>
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-3 gap-6 md:grid-cols-3">
          {[
            { value: "10+", label: "Acomodações únicas" },
            { value: "4.9★", label: "Avaliação média" },
            { value: "2.000+", label: "Hóspedes satisfeitos" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "#2d5016", fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: "0.8rem", color: "#7a7060", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACCOMMODATIONS ── */}
      <div ref={roomsRef} className="py-20 px-6" style={{ background: "#f7f4ef" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ fontSize: "0.75rem", color: "#c4882a", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Nossas Acomodações</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#1a2e14", fontWeight: 600, lineHeight: 1.2 }}>
              Refúgios na floresta<br />
              <em style={{ color: "#c4882a" }}>para cada momento</em>
            </h2>
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {featuredRooms.map(room => {
              const img = ROOM_IMAGES[room.id] || room.image;
              return (
                <div
                  key={room.id}
                  className="rounded-2xl overflow-hidden group cursor-pointer transition-all hover:shadow-2xl"
                  style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}
                  onClick={onStartBooking}
                >
                  <div className="relative overflow-hidden" style={{ height: 220 }}>
                    <img
                      src={img}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full" style={{ fontSize: "0.68rem", background: "#1a2e14cc", color: "#d4a84b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", backdropFilter: "blur(8px)" }}>
                        {room.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(247,244,239,0.9)", fontSize: "0.72rem", fontWeight: 600, color: "#1a2e14" }}>
                      <Star size={11} fill="#c4882a" style={{ color: "#c4882a" }} /> 4.9
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#1a2e14", fontWeight: 600 }}>{room.name}</div>
                        <div className="flex items-center gap-1 mt-0.5" style={{ fontSize: "0.78rem", color: "#7a7060" }}>
                          <Users size={12} /> {room.capacity} hóspedes
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "#2d5016", fontWeight: 700 }}>R$ {room.price}</div>
                        <div style={{ fontSize: "0.68rem", color: "#7a7060" }}>/noite</div>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#7a7060", lineHeight: 1.55, marginBottom: 14 }}>{room.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {room.amenities.slice(0, 3).map(a => (
                          <span key={a} className="px-2 py-0.5 rounded-full" style={{ fontSize: "0.65rem", background: "#2d501612", color: "#2d5016", fontWeight: 500 }}>
                            {a === "wifi" ? "Wi-Fi" : a === "ar-cond" ? "A/C" : "Café"}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onStartBooking(); }}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors"
                        style={{ background: "#1a2e14", color: "#f7f4ef", fontSize: "0.78rem", fontWeight: 600 }}
                      >
                        Ver Detalhes <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={onStartBooking}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full transition-all"
              style={{ border: "2px solid #2d5016", color: "#2d5016", fontSize: "0.9rem", fontWeight: 600, background: "transparent" }}
            >
              Ver Todas as Acomodações <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── NATURE SECTION ── */}
      <div style={{ background: "#1a2e14" }} className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={CANOPY_IMAGE} alt="Floresta amazônica" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div style={{ fontSize: "0.75rem", color: "#c4882a", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Nossa Essência</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#f7f4ef", fontWeight: 600, lineHeight: 1.2, marginBottom: 18 }}>
              Vivência autêntica na<br />
              <em style={{ color: "#d4a84b" }}>Amazônia profunda</em>
            </h2>
            <p style={{ fontSize: "0.95rem", color: "rgba(247,244,239,0.75)", lineHeight: 1.75, marginBottom: 24 }}>
              A Tribo Hospedagem nasceu do amor pela floresta e pelo desejo de compartilhar essa riqueza com visitantes do mundo inteiro. Cada acomodação foi cuidadosamente projetada para oferecer conforto sem abrir mão da imersão na natureza.
            </p>
            <div className="flex flex-wrap gap-4">
              {[{ icon: Leaf, label: "100% Sustentável" }, { icon: Trees, label: "Área Preservada" }, { icon: Wind, label: "Ar Puro" }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(196,136,42,0.15)", border: "1px solid rgba(196,136,42,0.3)" }}>
                  <Icon size={14} style={{ color: "#c4882a" }} />
                  <span style={{ fontSize: "0.8rem", color: "#d4a84b", fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden" style={{ height: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <img src={RIVER_IMAGE} alt="Rio Amazônico" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl p-4" style={{ background: "#c4882a", width: 140 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#1a2e14", fontWeight: 700, lineHeight: 1 }}>15+</div>
              <div style={{ fontSize: "0.72rem", color: "#1a2e14", fontWeight: 600, marginTop: 2 }}>anos de experiência</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BENEFITS ── */}
      <div ref={benefitsRef} className="py-20 px-6" style={{ background: "#f0ead8" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ fontSize: "0.75rem", color: "#c4882a", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Por que nos escolher</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#1a2e14", fontWeight: 600 }}>
              Tudo o que você precisa para<br />
              <em style={{ color: "#c4882a" }}>uma estadia perfeita</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 transition-all hover:shadow-md" style={{ background: "#fdfaf5", border: "1px solid rgba(44,35,18,0.08)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "#1a2e14" }}>
                  <Icon size={20} style={{ color: "#c4882a" }} />
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#1a2e14", fontWeight: 600, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: "0.82rem", color: "#7a7060", lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="py-20 px-6" style={{ background: "#fdfaf5" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ fontSize: "0.75rem", color: "#c4882a", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Depoimentos</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#1a2e14", fontWeight: 600 }}>
              O que nossos hóspedes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, origin, rating, text }) => (
              <div key={name} className="rounded-2xl p-6" style={{ background: "#f7f4ef", border: "1px solid rgba(44,35,18,0.08)" }}>
                <StarRating count={rating} />
                <p style={{ fontSize: "0.9rem", color: "#3a3228", lineHeight: 1.7, margin: "14px 0 18px", fontStyle: "italic" }}>"{text}"</p>
                <div>
                  <div style={{ fontWeight: 600, color: "#1a2e14", fontSize: "0.9rem" }}>{name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#7a7060" }}>{origin}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <div className="relative overflow-hidden py-20 px-6" style={{ background: "#2d5016" }}>
        <div className="absolute inset-0 opacity-10">
          <img src={CABIN_IMAGE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative text-center max-w-xl mx-auto">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#f7f4ef", fontWeight: 600, marginBottom: 14 }}>
            Pronto para sua aventura?
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(247,244,239,0.75)", marginBottom: 28, lineHeight: 1.65 }}>
            Reserve agora e garanta sua estadia na floresta. Disponibilidade limitada.
          </p>
          <button
            onClick={onStartBooking}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full transition-all"
            style={{ background: "#c4882a", color: "#1a2e14", fontSize: "1rem", fontWeight: 700 }}
          >
            Fazer Minha Reserva <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer ref={contactRef} style={{ background: "#111c0b", color: "rgba(247,244,239,0.7)" }}>
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#c4882a" }}>
                  <Trees size={18} style={{ color: "#1a2e14" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: "#f7f4ef", fontSize: "1rem", fontWeight: 600 }}>Tribo Hospedagem</div>
                  <div style={{ fontSize: "0.6rem", color: "#c4882a", letterSpacing: "0.12em", textTransform: "uppercase" }}>Amazônia</div>
                </div>
              </div>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.65, color: "rgba(247,244,239,0.55)" }}>
                Experiências autênticas na floresta amazônica desde 2010.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <div style={{ fontSize: "0.72rem", color: "#c4882a", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Navegação</div>
              <div className="flex flex-col gap-2.5">
                {["Início", "Acomodações", "Benefícios", "Contato"].map(l => (
                  <button key={l} style={{ fontSize: "0.85rem", color: "rgba(247,244,239,0.6)", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: "0.72rem", color: "#c4882a", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Contato</div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: MapPin, text: "Manaus, Amazonas — Brasil" },
                  { icon: Phone, text: "(92) 99999-0000" },
                  { icon: Mail, text: "contato@tribohospedagem.com.br" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <Icon size={14} style={{ color: "#c4882a", flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: "0.83rem", color: "rgba(247,244,239,0.6)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <div style={{ fontSize: "0.72rem", color: "#c4882a", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Redes Sociais</div>
              <div className="flex gap-3 mb-5">
                {[Camera, MessageCircle].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(247,244,239,0.6)" }}>
                    <Icon size={17} />
                  </a>
                ))}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(247,244,239,0.35)", marginTop: 16 }}>
                Horário: Seg–Sex 8h–20h
              </div>
            </div>
          </div>

          <div className="border-t flex items-center justify-between flex-wrap gap-3 pt-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "0.75rem", color: "rgba(247,244,239,0.3)" }}>
              © 2026 Tribo Hospedagem. Todos os direitos reservados.
            </div>
            <button
              onClick={onAdminAccess}
              style={{ fontSize: "0.72rem", color: "rgba(247,244,239,0.2)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
            >
              Área Administrativa
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
