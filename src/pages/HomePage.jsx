import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "../lib/api";
import { Link } from "react-router-dom";

// ─── Fade-in on scroll ───────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "", y = 40 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Ornamental divider ──────────────────────────────────────────────────────
function Ornament() {
  return (
    <div className="flex items-center gap-4 justify-center my-2">
      <span className="block w-10 h-px bg-gold opacity-60" />
      <span className="text-gold text-xs opacity-60">✦</span>
      <span className="block w-10 h-px bg-gold opacity-60" />
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <p className="font-body uppercase tracking-[0.4em] text-xs text-gold mb-4 inline-block">
      {children}
    </p>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ nombre: "", email: "", programa: "", nivel: "", mensaje: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("http://localhost:5000/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ nombre: "", email: "", programa: "", nivel: "", mensaje: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass = "w-full bg-transparent border-b border-white/15 text-white font-body font-light text-sm py-4 placeholder-white/25 focus:outline-none focus:border-gold transition-colors duration-300";
  const labelClass = "font-body text-[9px] uppercase tracking-[0.4em] text-white/30 block mb-2";

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gold/20 p-16 text-center"
      >
        <Ornament />
        <h3 className="font-display text-4xl font-light mt-8 mb-4">
          Mensaje <em className="italic text-gold">recibido</em>
        </h3>
        <p className="font-body font-light text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
          Un maestro de Aurum te contactará en las próximas 24 horas para
          agendar tu primera clase sin costo.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-10 font-body text-[10px] uppercase tracking-[0.4em] text-gold/60 hover:text-gold transition-colors"
        >
          Enviar otro mensaje →
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Nombre + Email */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            type="text" name="nombre" value={form.nombre} onChange={handleChange}
            placeholder="Tu nombre" required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="tu@email.com" required
            className={inputClass}
          />
        </div>
      </div>

      {/* Programa */}
      <div>
        <label className={labelClass}>Programa de interés</label>
        <select
          name="programa" value={form.programa} onChange={handleChange} required
          className={`${inputClass} bg-[#050505] cursor-pointer`}
        >
          <option value="" disabled>Selecciona un programa</option>
          <option value="clasico">Piano Clásico</option>
          <option value="cinematico">Piano Cinemático</option>
          <option value="jazz">Jazz & Improvisación</option>
          <option value="otro">Aún no lo sé</option>
        </select>
      </div>

      {/* Nivel */}
      <div>
        <label className={labelClass}>Nivel actual</label>
        <div className="flex gap-0 mt-2">
          {["Principiante", "Intermedio", "Avanzado"].map((n) => (
            <button
              key={n} type="button"
              onClick={() => setForm({ ...form, nivel: n })}
              className={`flex-1 py-3 text-[10px] uppercase tracking-[0.3em] font-body border transition-all duration-300 ${
                form.nivel === n
                  ? "bg-gold text-black border-gold"
                  : "bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white/60"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje */}
      <div>
        <label className={labelClass}>Cuéntanos más (opcional)</label>
        <textarea
          name="mensaje" value={form.mensaje} onChange={handleChange}
          placeholder="Tus metas, disponibilidad, preguntas..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Submit */}
      <div className="pt-4">
        <motion.button
          type="submit"
          disabled={status === "sending"}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] py-5 hover:bg-yellow-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Enviando..." : "Solicitar Primera Clase Gratis"}
        </motion.button>
        {status === "error" && (
          <p className="font-body text-[10px] text-red-400/70 text-center mt-4 tracking-wide">
            Hubo un error. Escríbenos directamente a proyectopianosena@gmail.com
          </p>
        )}
        <p className="font-body font-light text-white/20 text-[10px] text-center mt-4 tracking-wide">
          Sin compromisos · Primera clase sin costo
        </p>
      </div>
    </form>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [muted, setMuted] = useState(true);
  const [heroMedia, setHeroMedia] = useState(null);  // { tipo: 'video'|'imagen', src: string }
  const heroRef = useRef(null);
  const videoRef = useRef(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 180]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cargar configuración del hero desde el backend
  useEffect(() => {
    fetch(`${API_URL}/api/pagina/config`)
      .then(r => r.json())
      .then(data => {
        const cfg = data.config || {};
        if (cfg.hero_media_tipo && cfg.hero_media_src) {
          const src = cfg.hero_media_src.startsWith("/uploads/")
            ? `${API_URL}${cfg.hero_media_src}`
            : cfg.hero_media_src;
          setHeroMedia({ tipo: cfg.hero_media_tipo, src });
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: "#inicio",           label: "Inicio" },
    { href: "#programas",        label: "Programas" },
    { href: "#maestros",         label: "Maestros" },
    { href: "#conservatorios",   label: "Referentes" },
    { href: "#contacto",         label: "Contacto" },
  ];

  return (
    <div className="bg-[#080808] text-white overflow-x-hidden font-body">

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#080808]/95 backdrop-blur-2xl border-b border-white/[0.06] py-4"
          : "bg-transparent py-7"
      }`}>
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 flex items-center justify-between">
          <a href="#inicio" className="flex flex-col items-start leading-none group">
            <span className="font-display text-2xl md:text-3xl font-light tracking-[0.45em] text-gold transition-opacity duration-300 group-hover:opacity-80">
              AURUM
            </span>
            <span className="font-body text-[9px] tracking-[0.5em] uppercase text-white/40 mt-0.5">
              Piano Academy
            </span>
          </a>

          <ul className="hidden md:flex gap-10 items-center">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className="relative font-body text-[11px] uppercase tracking-[0.25em] text-white/60 hover:text-white transition-colors duration-300 group">
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="font-body text-[11px] uppercase tracking-[0.25em] text-white/50 hover:text-gold transition-colors duration-300">
              Acceso
            </Link>
            <a href="#contacto" className="inline-flex items-center gap-3 border border-gold/50 text-gold text-[10px] uppercase tracking-[0.3em] px-6 py-3 hover:bg-gold hover:text-black transition-all duration-300">
              Inscríbete
            </a>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-[5px] p-2" aria-label="Menu">
            <span className={`block w-6 h-px bg-gold transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[9px]" : ""}`} />
            <span className={`block w-4 h-px bg-gold transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px bg-gold transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#080808]/98 backdrop-blur-2xl z-40 flex flex-col items-center justify-center gap-10"
          >
            {navLinks.map(({ href, label }, i) => (
              <motion.a key={href} href={href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                onClick={() => setMenuOpen(false)}
                className="font-display text-4xl font-light tracking-[0.2em] text-white/80 hover:text-gold transition-colors"
              >
                {label}
              </motion.a>
            ))}
            <motion.a href="#contacto"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              onClick={() => setMenuOpen(false)}
              className="mt-6 border border-gold/50 text-gold text-[10px] uppercase tracking-[0.35em] px-8 py-4"
            >
              Inscríbete
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section id="inicio" ref={heroRef} className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          {/* Si hay imagen en config, mostrarla; si no, usar video por defecto */}
          {heroMedia?.tipo === "imagen" ? (
            <img
              src={heroMedia.src}
              alt="Hero"
              className="absolute w-full h-full object-cover grayscale"
            />
          ) : (
            <video
              key={heroMedia?.src || "default"}
              ref={videoRef}
              autoPlay loop muted={muted} playsInline
              className="absolute w-full h-full object-cover grayscale"
            >
              <source
                src={heroMedia?.src || "https://assets.mixkit.co/videos/preview/mixkit-hands-playing-a-grand-piano-4425-large.mp4"}
                type="video/mp4"
              />
            </video>
          )}
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#080808]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <Label>Academia Internacional de Piano · Fundada 2024</Label>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-light text-[clamp(3.5rem,10vw,9rem)] leading-[0.92] tracking-[-0.01em] mb-8"
          >
            El arte del piano
            <br />
            <em className="italic text-gold/90">llevado al límite</em>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.9 }}
            className="w-24 h-px bg-gold mx-auto mb-8 origin-left"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="font-body text-white/55 text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed tracking-wide font-light"
          >
            Formación de élite inspirada en los grandes conservatorios del mundo.
            Técnica, interpretación y composición con maestros internacionales.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <a href="#contacto" className="bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] px-10 py-5 hover:bg-yellow-300 transition-all duration-300 hover:scale-[1.02]">
              Comenzar Ahora
            </a>
            <a href="#programas" className="border border-white/30 text-white/70 font-body text-[10px] uppercase tracking-[0.4em] px-10 py-5 hover:border-white hover:text-white transition-all duration-300">
              Explorar Programas
            </a>
          </motion.div>
        </motion.div>

        {/* Mute button */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          onClick={() => setMuted(m => !m)}
          className="absolute bottom-10 right-8 md:right-16 flex items-center gap-2 group"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
        >
          <span className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 group-hover:text-white/60 transition-colors">
            {muted ? "Sonido" : "Silenciar"}
          </span>
          <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center group-hover:border-gold/50 transition-colors">
            {muted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40 group-hover:text-gold/70 transition-colors">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/70">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            )}
          </div>
        </motion.button>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* INTRO STATEMENT */}
      <section className="py-32 md:py-40 px-8 md:px-20 bg-[#080808]">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <Ornament />
            <h2 className="font-display font-light text-[clamp(2rem,5vw,4.5rem)] leading-tight mt-8 mb-8 text-white/90">
              No enseñamos piano.
              <br />
              <em className="italic text-gold">Formamos artistas.</em>
            </h2>
            <p className="font-body font-light text-white/45 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Cada programa está diseñado con la rigurosidad de los mejores conservatorios del mundo,
              adaptado para una generación que exige excelencia sin fronteras geográficas.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* PROGRAMAS */}
      <section id="programas" className="py-32 px-8 md:px-20 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn className="mb-20">
            <Label>Programas Exclusivos</Label>
            <h2 className="font-display font-light text-[clamp(2.5rem,6vw,6rem)] leading-[0.95] mt-2">
              Formación para
              <br />
              <em className="italic text-gold">pianistas de élite</em>
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.05]">
            {[
              { num: "01", title: "Piano Clásico",       italic: "Tradición & Excelencia", desc: "Técnica avanzada, repertorio europeo y preparación para conservatorios internacionales. De Bach a Ravel.", highlight: false },
              { num: "02", title: "Piano Cinemático",    italic: "Emoción & Narrativa",    desc: "Composición emocional inspirada en Hans Zimmer, Ludovico Einaudi y las grandes bandas sonoras del cine contemporáneo.", highlight: true },
              { num: "03", title: "Jazz & Improvisación",italic: "Libertad & Lenguaje",    desc: "Armonía moderna, improvisación y dominio del lenguaje musical contemporáneo. Del bebop al jazz modal.", highlight: false },
            ].map(({ num, title, italic, desc, highlight }, i) => (
              <FadeIn key={num} delay={i * 0.12}>
                <div className={`group relative p-12 md:p-16 cursor-pointer transition-all duration-500 h-full flex flex-col justify-between min-h-[420px] ${highlight ? "bg-gold text-black" : "bg-[#0d0d0d] hover:bg-[#111] text-white"}`}>
                  <div>
                    <span className={`font-display text-7xl font-light leading-none mb-8 block ${highlight ? "text-black/20" : "text-white/10"}`}>{num}</span>
                    <h3 className="font-display text-3xl md:text-4xl font-light mb-2">{title}</h3>
                    <em className={`font-display italic text-sm ${highlight ? "text-black/60" : "text-gold/70"}`}>{italic}</em>
                    <p className={`font-body font-light text-sm leading-relaxed mt-6 ${highlight ? "text-black/70" : "text-white/45"}`}>{desc}</p>
                  </div>
                  <div className={`mt-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] font-body transition-all duration-300 ${highlight ? "text-black/70" : "text-gold/60 group-hover:text-gold"}`}>
                    <span>Ver programa</span>
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>→</motion.span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* MAESTROS */}
      <section id="maestros" className="py-32 px-8 md:px-20 bg-[#080808]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
            <FadeIn>
              <Label>Cuerpo Docente</Label>
              <h2 className="font-display font-light text-[clamp(2.5rem,6vw,6rem)] leading-[0.95] mt-2">
                Maestros
                <br />
                <em className="italic text-gold">internacionales</em>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2} className="md:max-w-xs">
              <p className="font-body font-light text-white/40 text-sm leading-relaxed">
                Pianistas, compositores y concertistas con trayectoria en los principales
                escenarios del mundo, dedicados a formar la nueva generación de artistas.
              </p>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Isabella Moretti", role: "Piano Clásico",          origin: "Milán, Italia",         img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop" },
              { name: "Alexander Noir",  role: "Composición Cinemática",  origin: "París, Francia",         img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop" },
              { name: "Amelia Laurent",  role: "Jazz & Improvisación",    origin: "Nueva Orleans, EE.UU.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop" },
            ].map(({ name, role, origin, img }, i) => (
              <FadeIn key={name} delay={i * 0.15}>
                <div className="group relative overflow-hidden aspect-[3/4]">
                  <img src={img} alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="block w-8 h-px bg-gold mb-4 transition-all duration-500 group-hover:w-16" />
                    <p className="font-body text-[9px] uppercase tracking-[0.4em] text-gold mb-2">{role}</p>
                    <h3 className="font-display text-3xl font-light text-white mb-1">{name}</h3>
                    <p className="font-body text-white/40 text-xs">{origin}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCIA */}
      <section id="experiencia" className="py-32 px-8 md:px-20 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn className="text-center mb-24">
            <Label>Metodología</Label>
            <h2 className="font-display font-light text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] mt-2 mb-6">
              Una experiencia
              <br />
              <em className="italic text-gold">diseñada al detalle</em>
            </h2>
            <p className="font-body font-light text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
              Cada sesión combina rigor técnico, sensibilidad artística y seguimiento
              personalizado para garantizar un avance real y sostenido.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
            {[
              { n: "01", t: "Clases Personalizadas", d: "Adaptadas al nivel, ritmo y objetivos específicos de cada estudiante." },
              { n: "02", t: "Técnica Profesional",   d: "Postura, lectura musical y dominio técnico del instrumento desde la base." },
              { n: "03", t: "Repertorio Moderno",    d: "Música clásica, contemporánea y cinematográfica seleccionada por maestros." },
              { n: "04", t: "Seguimiento Continuo",  d: "Evaluación constante para medir la evolución y ajustar el proceso." },
            ].map(({ n, t, d }, i) => (
              <FadeIn key={n} delay={i * 0.1}>
                <div className="bg-[#0a0a0a] p-10 md:p-12 h-full group hover:bg-gold/5 transition-colors duration-500">
                  <span className="font-display text-5xl text-white/[0.06] font-light block mb-6">{n}</span>
                  <h3 className="font-display text-xl font-light text-white mb-4">{t}</h3>
                  <p className="font-body font-light text-white/35 text-sm leading-relaxed">{d}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-28 px-8 md:px-20 bg-[#080808] border-y border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04]">
            {[
              { n: "+500", label: "Horas de práctica guiada" },
              { n: "95%",  label: "Mejora técnica progresiva" },
              { n: "+120", label: "Repertorios disponibles" },
              { n: "24/7", label: "Acceso a contenido digital" },
            ].map(({ n, label }, i) => (
              <FadeIn key={label} delay={i * 0.1}>
                <div className="bg-[#0a0a0a] py-14 px-10 text-center">
                  <span className="font-display text-5xl md:text-6xl font-light text-gold block mb-3">{n}</span>
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-white/35">{label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-32 px-8 md:px-20 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn className="text-center mb-20">
            <Label>Testimonios</Label>
            <h2 className="font-display font-light text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] mt-2">
              Lo que dicen
              <br />
              <em className="italic text-gold">nuestros estudiantes</em>
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.04]">
            {[
              { quote: "Nunca pensé avanzar tan rápido. Las clases son dinámicas, modernas y realmente personalizadas.", name: "Valentina R.", program: "Piano Clásico", highlight: false },
              { quote: "La experiencia se siente como estudiar en un conservatorio moderno. Aprendí técnica y composición cinematográfica al mismo tiempo.", name: "Daniel M.", program: "Piano Cinemático", highlight: true },
              { quote: "Aurum me ayudó a perder el miedo escénico y a desarrollar mi propio lenguaje musical.", name: "Santiago P.", program: "Jazz & Improvisación", highlight: false },
            ].map(({ quote, name, program, highlight }, i) => (
              <FadeIn key={name} delay={i * 0.12}>
                <div className={`p-12 md:p-14 h-full flex flex-col justify-between ${highlight ? "bg-gold text-black" : "bg-[#0a0a0a] text-white"}`}>
                  <div>
                    <span className={`font-display text-6xl leading-none block mb-6 ${highlight ? "text-black/20" : "text-gold/20"}`}>"</span>
                    <p className={`font-display italic text-xl md:text-2xl font-light leading-relaxed ${highlight ? "text-black/85" : "text-white/75"}`}>{quote}</p>
                  </div>
                  <div className="mt-10">
                    <span className={`block w-8 h-px mb-5 ${highlight ? "bg-black/30" : "bg-gold/40"}`} />
                    <p className={`font-display text-lg font-medium ${highlight ? "text-black" : "text-white"}`}>{name}</p>
                    <p className={`font-body text-[10px] uppercase tracking-[0.3em] mt-1 ${highlight ? "text-black/50" : "text-gold/60"}`}>{program}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CONSERVATORIOS DEL MUNDO */}
      <section id="conservatorios" className="py-32 px-8 md:px-20 bg-[#080808]">
        <div className="max-w-[1400px] mx-auto">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
            <FadeIn>
              <Label>Referentes Mundiales</Label>
              <h2 className="font-display font-light text-[clamp(2.5rem,6vw,6rem)] leading-[0.95] mt-2">
                Inspirados en los
                <br />
                <em className="italic text-gold">mejores del mundo</em>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2} className="md:max-w-sm">
              <p className="font-body font-light text-white/40 text-sm leading-relaxed">
                Aurum toma lo mejor de cada institución — la rigurosidad técnica de Juilliard,
                la tradición europea de la RAM, la innovación de Berklee — y lo lleva a una
                experiencia accesible desde cualquier lugar del mundo.
              </p>
            </FadeIn>
          </div>

          {/* Featured — Juilliard */}
          <FadeIn className="mb-px">
            <div className="group relative overflow-hidden bg-[#0a0a0a] border-t border-white/[0.06]">
              <div className="grid md:grid-cols-2 min-h-[480px]">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1200&auto=format&fit=crop"
                    alt="The Juilliard School"
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 min-h-[320px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent md:hidden" />
                </div>
                <div className="flex flex-col justify-center p-12 md:p-16">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="font-body text-[9px] uppercase tracking-[0.5em] text-gold">Nueva York, EE.UU.</span>
                    <span className="block w-8 h-px bg-gold/40" />
                    <span className="font-body text-[9px] uppercase tracking-[0.5em] text-white/25">Est. 1905</span>
                  </div>
                  <h3 className="font-display text-5xl md:text-6xl font-light mb-4 leading-none">
                    The Juilliard
                    <br />
                    <em className="italic text-gold/80">School</em>
                  </h3>
                  <p className="font-body font-light text-white/40 text-sm leading-relaxed mb-8 max-w-md">
                    La institución más selectiva del mundo en artes escénicas. Sus graduados incluyen a
                    Itzhak Perlman, Yo-Yo Ma y Lang Lang. El estándar absoluto de la técnica pianística
                    y la interpretación clásica contemporánea.
                  </p>
                  <div className="grid grid-cols-3 gap-6 mb-10 pt-8 border-t border-white/[0.06]">
                    {[
                      { n: "~9%",    l: "Tasa de admisión" },
                      { n: "600+",   l: "Estudiantes de piano" },
                      { n: "120",    l: "Años de historia" },
                    ].map(({ n, l }) => (
                      <div key={l}>
                        <span className="font-display text-3xl text-gold font-light block">{n}</span>
                        <span className="font-body text-[10px] uppercase tracking-[0.2em] text-white/30 leading-tight block mt-1">{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="block w-8 h-px bg-gold/40" />
                    <span className="font-body text-[10px] uppercase tracking-[0.35em] text-gold/60">Lo que adoptamos</span>
                  </div>
                  <p className="font-body font-light text-white/35 text-sm mt-3 leading-relaxed">
                    Rigor técnico extremo, metodología de masterclass y preparación para audiciones internacionales.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Grid — RAM + Berklee + RCM + Paris */}
          <div className="grid md:grid-cols-2 gap-px bg-white/[0.04] mt-px">

            {[
              {
                name: "Royal Academy of Music",
                short: "RAM",
                city: "Londres, Reino Unido",
                year: "Est. 1822",
                img: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=900&auto=format&fit=crop",
                desc: "La academia real más antigua del mundo angloparlante. Formó a pianistas como Myra Hess y Harrison Birtwistle. Su enfoque combina tradición romántica con música contemporánea de vanguardia.",
                adopted: "Sensibilidad histórica, análisis del repertorio y la conexión entre técnica e interpretación expresiva.",
                stats: [{ n: "200+", l: "Años de tradición" }, { n: "800", l: "Estudiantes activos" }, { n: "Top 3", l: "Mundial QS Ranking" }],
              },
              {
                name: "Berklee College of Music",
                short: "BERKLEE",
                city: "Boston, EE.UU.",
                year: "Est. 1945",
                img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=900&auto=format&fit=crop",
                desc: "La institución más influyente en música contemporánea y jazz. Pionera en producción, composición para cine y métodos modernos de improvisación que han definido el sonido del siglo XXI.",
                adopted: "Libertad creativa, improvisación, composición cinematográfica y producción musical moderna.",
                stats: [{ n: "6K+",  l: "Estudiantes" }, { n: "100+",  l: "Países representados" }, { n: "#1",   l: "Jazz & Contemporary" }],
              },
              {
                name: "Royal Conservatory of Music",
                short: "RCM",
                city: "Toronto, Canadá",
                year: "Est. 1886",
                img: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=900&auto=format&fit=crop",
                desc: "El sistema de certificación pianística más utilizado del mundo. Su currículo progresivo y sus exámenes internacionales son el referente global para la enseñanza estructurada del piano.",
                adopted: "Sistema de niveles, progresión pedagógica clara y evaluación objetiva del avance técnico.",
                stats: [{ n: "500K+", l: "Exámenes anuales" }, { n: "10",   l: "Niveles de certificación" }, { n: "140",  l: "Años de legado" }],
              },
              {
                name: "Conservatoire de Paris",
                short: "CNSMDP",
                city: "París, Francia",
                year: "Est. 1795",
                img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=900&auto=format&fit=crop",
                desc: "Fundado por Napoleón Bonaparte, es la cuna del piano francés. Formó a Debussy, Ravel y Fauré. Su escuela define la elegancia tímbrica, el fraseo lírico y la poética sonora francesa.",
                adopted: "Refinamiento del sonido, poética musical, repertorio impresionista y el arte del fraseo sensible.",
                stats: [{ n: "230",  l: "Años de historia" }, { n: "1200", l: "Estudiantes" }, { n: "Top 5", l: "Europa" }],
              },
            ].map(({ name, short, city, year, img, desc, adopted, stats }, i) => (
              <FadeIn key={short} delay={i * 0.1}>
                <div className="group bg-[#0a0a0a] p-10 md:p-12 h-full flex flex-col gap-8 hover:bg-[#0e0e0e] transition-colors duration-500">
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={img}
                      alt={name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="font-display text-2xl font-light tracking-[0.15em] text-white/80">{short}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-body text-[9px] uppercase tracking-[0.45em] text-gold">{city}</span>
                      <span className="block w-5 h-px bg-gold/30" />
                      <span className="font-body text-[9px] uppercase tracking-[0.45em] text-white/20">{year}</span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-light text-white mb-4 leading-tight">{name}</h3>
                    <p className="font-body font-light text-white/40 text-sm leading-relaxed">{desc}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.06]">
                    {stats.map(({ n, l }) => (
                      <div key={l}>
                        <span className="font-display text-2xl text-gold font-light block">{n}</span>
                        <span className="font-body text-[9px] uppercase tracking-[0.15em] text-white/25 leading-tight block mt-1">{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/[0.04]">
                    <p className="font-body text-[9px] uppercase tracking-[0.35em] text-gold/50 mb-2">Lo que adoptamos en Aurum</p>
                    <p className="font-body font-light text-white/30 text-xs leading-relaxed">{adopted}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Closing statement */}
          <FadeIn className="mt-20 text-center">
            <Ornament />
            <p className="font-display italic font-light text-[clamp(1.4rem,3vw,2.2rem)] text-white/60 max-w-3xl mx-auto mt-8 leading-relaxed">
              "No reemplazamos a estos conservatorios.
              <br />
              <span className="text-gold/80">Los traemos a ti."</span>
            </p>
          </FadeIn>

        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-32 px-8 md:px-20 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto">

          <div className="grid md:grid-cols-2 gap-20 items-start">

            {/* Left — copy */}
            <FadeIn>
              <Label>Empieza Hoy</Label>
              <h2 className="font-display font-light text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.92] mt-2 mb-8">
                Hablemos
                <br />
                <em className="italic text-gold">de tu camino</em>
              </h2>
              <p className="font-body font-light text-white/40 text-sm leading-relaxed mb-12 max-w-sm">
                Cuéntanos tu nivel, tus metas y el programa que te interesa.
                Un maestro de Aurum te contactará en menos de 24 horas para
                agendar tu primera clase sin costo.
              </p>

              <div className="space-y-8">
                {[
                  { icon: "✦", title: "Primera clase gratuita", desc: "Sin compromisos. Evaluamos tu nivel y te orientamos." },
                  { icon: "✦", title: "Respuesta en 24h",       desc: "Nuestro equipo te contacta directamente." },
                  { icon: "✦", title: "100% personalizado",     desc: "Cada plan se construye para ti." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-5">
                    <span className="text-gold/60 text-xs mt-1 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-body text-sm font-medium text-white/80 mb-1">{title}</p>
                      <p className="font-body font-light text-white/35 text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 pt-10 border-t border-white/[0.06]">
                <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/25 mb-5">También puedes escribirnos</p>
                <a href="mailto:proyectopianosena@gmail.com" className="font-display text-xl font-light text-gold hover:text-gold-light transition-colors duration-300 block mb-3">
                  proyectopianosena@gmail.com
                </a>
                <a href="tel:+573026570578" className="font-display text-xl font-light text-gold hover:text-gold-light transition-colors duration-300 block">
                  +57 302 6570578
                </a>
              </div>
            </FadeIn>

            {/* Right — form */}
            <FadeIn delay={0.2}>
              <ContactForm />
            </FadeIn>

          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative py-48 px-8 md:px-20 overflow-hidden bg-[#080808]">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2000&auto=format&fit=crop" alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#080808]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn>
            <Ornament />
            <h2 className="font-display font-light text-[clamp(3rem,8vw,8rem)] leading-[0.9] mt-8 mb-8">
              Lleva tu talento
              <br />
              <em className="italic text-gold">al siguiente nivel</em>
            </h2>
            <p className="font-body font-light text-white/40 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-14">
              Únete a una experiencia de aprendizaje diseñada con los estándares de los
              mejores conservatorios y academias musicales del mundo.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <a href="#contacto" className="bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] px-12 py-5 hover:bg-yellow-300 transition-all duration-300 hover:scale-[1.02]">
                Inscribirme
              </a>
              <a href="#contacto" className="border border-white/20 text-white/60 font-body text-[10px] uppercase tracking-[0.4em] px-12 py-5 hover:border-white/50 hover:text-white transition-all duration-300">
                Agendar Clase
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#050505] px-8 md:px-20 pt-20 pb-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-1">
              <div className="mb-6">
                <span className="font-display text-3xl font-light tracking-[0.45em] text-gold block">AURUM</span>
                <span className="font-body text-[9px] tracking-[0.5em] uppercase text-white/25 block mt-0.5">Piano Academy</span>
              </div>
              <p className="font-body font-light text-white/30 text-sm leading-relaxed">
                Academia premium especializada en formación pianística, interpretación y composición contemporánea.
              </p>
            </div>
            <div>
              <h3 className="font-body text-[10px] uppercase tracking-[0.35em] text-white/30 mb-6">Navegación</h3>
              <ul className="space-y-3">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <a href={href} className="font-body font-light text-white/50 text-sm hover:text-gold transition-colors duration-200">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-body text-[10px] uppercase tracking-[0.35em] text-white/30 mb-6">Programas</h3>
              <ul className="space-y-3">
                {["Piano Clásico", "Piano Cinemático", "Jazz & Improvisación"].map(p => (
                  <li key={p}><span className="font-body font-light text-white/50 text-sm">{p}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-body text-[10px] uppercase tracking-[0.35em] text-white/30 mb-6">Contacto</h3>
              <ul className="space-y-3">
                {["proyectopianosena@gmail.com", "+57 302 6570578", "Colombia"].map(t => (
                  <li key={t}><span className="font-body font-light text-white/50 text-sm">{t}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-[10px] text-white/20 tracking-widest uppercase">© 2026 Aurum Piano Academy — Todos los derechos reservados</p>
            <p className="font-body text-[10px] text-white/15 tracking-widest uppercase">Formación de Élite · Colombia</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
