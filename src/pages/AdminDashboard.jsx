import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

function formatFecha(iso) {
  return new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}
function FadeIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }} className={className}>
      {children}
    </motion.div>
  );
}

const emptyClase = { titulo: "", descripcion: "", maestro: "", programa: "", fecha: "", duracion_min: 60, cupos: 5 };
const emptyMaestro = { nombre: "", rol: "", origen: "", activo: true, orden: 0 };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("resumen");
  const [contactos, setContactos]   = useState([]);
  const [alumnos, setAlumnos]       = useState([]);
  const [reservas, setReservas]     = useState([]);
  const [clases, setClases]         = useState([]);
  const [maestros, setMaestros]     = useState([]);
  const [pageConfig, setPageConfig] = useState({});
  const [claseForm, setClaseForm]   = useState(emptyClase);
  const [claseArchivos, setClaseArchivos] = useState([]);   // [{nombre,tipo,datos}]
  const [maestroForm, setMaestroForm] = useState(emptyMaestro);
  const [editMaestro, setEditMaestro] = useState(null);     // maestro en edición
  const [msg, setMsg]               = useState({ text: "", ok: true });
  const [loading, setLoading]       = useState(true);
  const archivoRef = useRef();
  const fotoRef    = useRef();

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 5000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [c, a, r, cl, m, pc] = await Promise.all([
        api("/api/admin/contactos"),
        api("/api/admin/alumnos"),
        api("/api/admin/reservas"),
        api("/api/clases"),
        api("/api/pagina/maestros/todos"),
        api("/api/pagina/config"),
      ]);
      setContactos(c.contactos || []);
      setAlumnos(a.alumnos || []);
      setReservas(r.reservas || []);
      setClases(cl.clases || []);
      setMaestros(m.maestros || []);
      setPageConfig(pc.config || {});
    } catch (err) { showMsg(err.message, false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ── Clases ──────────────────────────────────────────────
  const handleArchivos = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) return showMsg(`${file.name} supera 10MB`, false);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setClaseArchivos(prev => [...prev, {
          nombre: file.name,
          tipo: file.type,
          datos: ev.target.result,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const crearClase = async (e) => {
    e.preventDefault();
    try {
      await api("/api/clases", {
        method: "POST",
        body: JSON.stringify({ ...claseForm, archivos: claseArchivos }),
      });
      setClaseForm(emptyClase);
      setClaseArchivos([]);
      showMsg("Clase publicada correctamente.");
      load();
    } catch (err) { showMsg(err.message, false); }
  };

  const eliminarClase = async (id) => {
    if (!confirm("¿Eliminar esta clase?")) return;
    try {
      await api(`/api/clases/${id}`, { method: "DELETE" });
      showMsg("Clase eliminada.");
      load();
    } catch (err) { showMsg(err.message, false); }
  };

  // ── Maestros ─────────────────────────────────────────────
  const handleFotoMaestro = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return showMsg("La foto no puede superar 3MB.", false);
    const reader = new FileReader();
    reader.onload = ev => setter(prev => ({ ...prev, foto: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const crearMaestro = async (e) => {
    e.preventDefault();
    try {
      await api("/api/pagina/maestros", { method: "POST", body: JSON.stringify(maestroForm) });
      setMaestroForm(emptyMaestro);
      showMsg("Maestro agregado.");
      load();
    } catch (err) { showMsg(err.message, false); }
  };

  const guardarMaestro = async (e) => {
    e.preventDefault();
    try {
      await api(`/api/pagina/maestros/${editMaestro.id}`, { method: "PUT", body: JSON.stringify(editMaestro) });
      setEditMaestro(null);
      showMsg("Maestro actualizado.");
      load();
    } catch (err) { showMsg(err.message, false); }
  };

  const eliminarMaestro = async (id) => {
    if (!confirm("¿Eliminar este maestro?")) return;
    try {
      await api(`/api/pagina/maestros/${id}`, { method: "DELETE" });
      showMsg("Maestro eliminado.");
      load();
    } catch (err) { showMsg(err.message, false); }
  };

  const toggleMaestro = async (m) => {
    try {
      await api(`/api/pagina/maestros/${m.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...m, activo: !m.activo }),
      });
      load();
    } catch (err) { showMsg(err.message, false); }
  };

  // ── Configuración página ──────────────────────────────────
  const saveConfig = async (clave, valor) => {
    try {
      await api("/api/pagina/config", { method: "PUT", body: JSON.stringify({ clave, valor }) });
      setPageConfig(prev => ({ ...prev, [clave]: valor }));
      showMsg("Guardado.");
    } catch (err) { showMsg(err.message, false); }
  };

  const marcarLeido = async (id) => {
    try {
      await api(`/api/admin/contactos/${id}/leido`, { method: "PATCH" });
      setContactos(prev => prev.map(c => c.id === id ? { ...c, leido: true } : c));
    } catch {}
  };

  const noLeidos = contactos.filter(c => !c.leido).length;

  const tabs = [
    { id: "resumen",  label: "Resumen" },
    { id: "clases",   label: "Clases" },
    { id: "pagina",   label: "Gestión de página" },
    { id: "alumnos",  label: "Alumnos" },
    { id: "reservas", label: "Reservas" },
    { id: "contactos",label: "Contactos" },
  ];

  const inputCls = "w-full bg-transparent border-b border-white/15 py-3 text-sm font-body text-white focus:outline-none focus:border-gold transition-colors placeholder-white/20";
  const labelCls = "font-body text-[9px] uppercase tracking-[0.4em] text-white/30 block mb-2";

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-73px)]">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-60 border-r border-white/[0.06] px-6 py-10 shrink-0">
          <div className="mb-10">
            <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mb-4">
              <span className="font-display text-xl text-gold font-light">A</span>
            </div>
            <p className="font-display text-base font-light leading-tight">{user?.nombre}</p>
            <p className="font-body text-[9px] uppercase tracking-[0.35em] text-gold/60 mt-1">Administrador</p>
          </div>
          <nav className="space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full text-left font-body text-[11px] uppercase tracking-[0.3em] px-3 py-3 transition-all duration-200 flex items-center justify-between ${
                  tab === t.id ? "text-gold border-l-2 border-gold pl-4" : "text-white/35 hover:text-white/70"
                }`}>
                <span>{t.label}</span>
                {t.id === "contactos" && noLeidos > 0 && (
                  <span className="bg-gold text-black text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{noLeidos}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-4 border-b border-white/[0.06] shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`shrink-0 font-body text-[10px] uppercase tracking-[0.3em] px-4 py-2 border transition-colors ${
                tab === t.id ? "bg-gold text-black border-gold" : "border-white/10 text-white/40"
              }`}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 px-6 md:px-12 py-10 overflow-x-hidden min-w-0">
          {msg.text && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className={`mb-6 px-5 py-3 border text-sm font-body ${msg.ok ? "border-gold/30 text-gold" : "border-red-400/30 text-red-400/80"}`}>
              {msg.text}
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* ── RESUMEN ── */}
            {tab === "resumen" && (
              <motion.div key="resumen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <p className="font-body text-[9px] uppercase tracking-[0.4em] text-gold mb-2">Panel</p>
                  <h1 className="font-display font-light text-4xl md:text-5xl mb-2">Panel <em className="italic text-gold">administrativo</em></h1>
                  <p className="font-body font-light text-white/35 text-sm mb-10">Gestión completa de Aurum Piano Academy.</p>
                </FadeIn>
                <FadeIn delay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] mb-12">
                  {[
                    { n: alumnos.length,  label: "Estudiantes" },
                    { n: clases.length,   label: "Clases activas" },
                    { n: reservas.length, label: "Reservas" },
                    { n: noLeidos,        label: "Mensajes nuevos", hi: noLeidos > 0 },
                  ].map(({ n, label, hi }) => (
                    <div key={label} className="bg-[#0a0a0a] p-8 text-center">
                      <span className={`font-display text-4xl font-light block mb-2 ${hi ? "text-gold" : "text-white/70"}`}>{n}</span>
                      <span className="font-body text-[10px] uppercase tracking-[0.25em] text-white/30">{label}</span>
                    </div>
                  ))}
                </FadeIn>
                <FadeIn delay={0.2}>
                  <h2 className="font-display text-2xl font-light mb-5">Acciones <em className="italic text-gold">rápidas</em></h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { label: "Publicar nueva clase", action: () => setTab("clases"),   sub: "Agrega sesiones al calendario" },
                      { label: "Gestión de página",    action: () => setTab("pagina"),   sub: "Maestros, hero, contenido" },
                      { label: "Mensajes nuevos",      action: () => setTab("contactos"),sub: `${noLeidos} sin leer`, gold: noLeidos > 0 },
                    ].map(({ label, action, sub, gold }) => (
                      <button key={label} onClick={action}
                        className={`text-left p-8 border transition-all duration-300 hover:bg-[#0e0e0e] ${gold ? "border-gold/30 bg-gold/5" : "border-white/[0.06] bg-[#0a0a0a]"}`}>
                        <p className="font-display text-lg font-light mb-2">{label}</p>
                        <p className="font-body text-white/35 text-xs">{sub}</p>
                        <span className="inline-block mt-4 font-body text-[10px] uppercase tracking-[0.3em] text-gold/60">Ir →</span>
                      </button>
                    ))}
                  </div>
                </FadeIn>
              </motion.div>
            )}

            {/* ── CLASES ── */}
            {tab === "clases" && (
              <motion.div key="clases" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <h1 className="font-display font-light text-4xl mb-2">Gestión de <em className="italic text-gold">clases</em></h1>
                  <p className="font-body text-white/35 text-sm mb-10">Publica sesiones con materiales adjuntos.</p>
                </FadeIn>

                <FadeIn delay={0.1} className="mb-14">
                  <h2 className="font-display text-xl font-light mb-6 text-white/70">Publicar nueva clase</h2>
                  <form onSubmit={crearClase} className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className={labelCls}>Título *</label>
                        <input type="text" required value={claseForm.titulo}
                          onChange={e => setClaseForm({...claseForm, titulo: e.target.value})}
                          className={inputCls} placeholder="Ej: Técnica Hanon avanzada" />
                      </div>
                      <div>
                        <label className={labelCls}>Maestro</label>
                        <input type="text" value={claseForm.maestro}
                          onChange={e => setClaseForm({...claseForm, maestro: e.target.value})}
                          className={inputCls} placeholder="Nombre del maestro" />
                      </div>
                      <div>
                        <label className={labelCls}>Fecha y hora *</label>
                        <input type="datetime-local" required value={claseForm.fecha}
                          onChange={e => setClaseForm({...claseForm, fecha: e.target.value})}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Cupos *</label>
                        <input type="number" min="1" required value={claseForm.cupos}
                          onChange={e => setClaseForm({...claseForm, cupos: e.target.value})}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Programa</label>
                        <select value={claseForm.programa}
                          onChange={e => setClaseForm({...claseForm, programa: e.target.value})}
                          className={`${inputCls} bg-[#0a0a0a]`}>
                          <option value="">Todos los programas</option>
                          <option value="clasico">Piano Clásico</option>
                          <option value="cinematico">Piano Cinemático</option>
                          <option value="jazz">Jazz & Improvisación</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Duración (min)</label>
                        <input type="number" value={claseForm.duracion_min}
                          onChange={e => setClaseForm({...claseForm, duracion_min: e.target.value})}
                          className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Descripción</label>
                      <textarea rows={3} value={claseForm.descripcion}
                        onChange={e => setClaseForm({...claseForm, descripcion: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 p-3 text-sm font-body text-white focus:outline-none focus:border-gold resize-none"
                        placeholder="Descripción de la clase..." />
                    </div>

                    {/* Archivos adjuntos */}
                    <div>
                      <label className={labelCls}>Materiales adjuntos (videos, PDFs, imágenes, Word)</label>
                      <div
                        onClick={() => archivoRef.current?.click()}
                        className="border border-dashed border-white/15 p-8 text-center cursor-pointer hover:border-gold/40 transition-colors"
                      >
                        <p className="font-body text-white/30 text-sm mb-1">Haz clic para adjuntar archivos</p>
                        <p className="font-body text-white/20 text-xs">Videos, PDFs, imágenes, Word · Máx 10MB c/u</p>
                      </div>
                      <input ref={archivoRef} type="file" multiple className="hidden"
                        accept="video/*,application/pdf,image/*,.doc,.docx,.ppt,.pptx"
                        onChange={handleArchivos} />

                      {claseArchivos.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {claseArchivos.map((a, i) => (
                            <li key={i} className="flex items-center justify-between border border-white/[0.06] px-4 py-3 bg-[#0a0a0a]">
                              <div className="flex items-center gap-3">
                                <span className="text-gold/60 text-xs">
                                  {a.tipo.startsWith("video") ? "🎬" : a.tipo.includes("pdf") ? "📄" : a.tipo.startsWith("image") ? "🖼" : "📎"}
                                </span>
                                <span className="font-body text-white/60 text-sm">{a.nombre}</span>
                              </div>
                              <button type="button" onClick={() => setClaseArchivos(prev => prev.filter((_, j) => j !== i))}
                                className="font-body text-[10px] text-white/25 hover:text-red-400 transition-colors uppercase tracking-widest">
                                Quitar
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button type="submit" className="bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] px-10 py-4 hover:bg-yellow-300 transition-colors">
                      Publicar clase
                    </button>
                  </form>
                </FadeIn>

                {/* Lista clases */}
                <FadeIn delay={0.2}>
                  <h2 className="font-display text-xl font-light mb-5 text-white/60">Publicadas ({clases.length})</h2>
                  {loading ? <p className="font-body text-white/30 text-sm">Cargando...</p>
                  : clases.length === 0 ? <p className="font-body text-white/30 text-sm">No hay clases.</p>
                  : (
                    <div className="space-y-3">
                      {clases.map(c => (
                        <div key={c.id} className="border border-white/[0.06] p-5 bg-[#0a0a0a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="font-display text-lg font-light">{c.titulo}</p>
                            <div className="flex flex-wrap gap-4 mt-1">
                              <p className="font-body text-white/35 text-xs">{formatFecha(c.fecha)}</p>
                              {c.maestro && <p className="font-body text-white/25 text-xs">Maestro: {c.maestro}</p>}
                              {c.programa && <p className="font-body text-gold/40 text-xs capitalize">{c.programa}</p>}
                              <p className="font-body text-gold/50 text-xs">{c.cupos_disponibles} cupos</p>
                              {c.archivos && JSON.parse(c.archivos||"[]").length > 0 && (
                                <p className="font-body text-white/25 text-xs">{JSON.parse(c.archivos).length} archivo(s)</p>
                              )}
                            </div>
                          </div>
                          <button onClick={() => eliminarClase(c.id)}
                            className="font-body text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-red-400 transition-colors shrink-0">
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </FadeIn>
              </motion.div>
            )}

            {/* ── GESTIÓN DE PÁGINA ── */}
            {tab === "pagina" && (
              <motion.div key="pagina" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <h1 className="font-display font-light text-4xl mb-2">Gestión de <em className="italic text-gold">página</em></h1>
                  <p className="font-body text-white/35 text-sm mb-10">Controla el contenido visible en la landing.</p>
                </FadeIn>

                {/* Hero */}
                <FadeIn delay={0.1} className="mb-14">
                  <h2 className="font-display text-2xl font-light mb-6">Hero <em className="italic text-gold/70">— video y textos</em></h2>
                  <div className="space-y-8 max-w-xl">

                    {/* Upload desde dispositivo */}
                    <div>
                      <label className={labelCls}>Video o imagen del hero</label>
                      <p className="font-body text-white/20 text-xs mb-4">
                        Sube desde tu PC o celular. Se verá en blanco y negro automáticamente en la página.
                      </p>

                      <div
                        onClick={() => document.getElementById("hero_file_input").click()}
                        className="border border-dashed border-white/20 p-12 text-center cursor-pointer hover:border-gold/60 hover:bg-gold/[0.02] transition-all group"
                      >
                        <div className="text-4xl mb-3 transition-transform group-hover:scale-110 duration-300">🎬</div>
                        <p className="font-body text-white/50 text-sm mb-1 group-hover:text-white/70 transition-colors">Toca aquí para subir desde tu dispositivo</p>
                        <p className="font-body text-white/20 text-xs">Video MP4 · máx 50MB &nbsp;|&nbsp; Imagen JPG / PNG · máx 5MB</p>
                      </div>

                      <input
                        id="hero_file_input"
                        type="file"
                        accept="video/mp4,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const isVideo = file.type.startsWith("video/");
                          const maxMB   = isVideo ? 50 : 5;
                          if (file.size > maxMB * 1024 * 1024) {
                            return showMsg(`El archivo supera ${maxMB}MB. Elige uno más pequeño.`, false);
                          }
                          showMsg(`Subiendo ${isVideo ? "video" : "imagen"}... espera un momento`, true);
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            try {
                              const data = await api("/api/pagina/hero-media", {
                                method: "POST",
                                body: JSON.stringify({
                                  nombre: file.name,
                                  tipo: isVideo ? "video" : "imagen",
                                  datos: ev.target.result,
                                }),
                              });
                              const fullSrc = `http://localhost:5000${data.url}`;
                              setPageConfig(prev => ({
                                ...prev,
                                hero_media_src: fullSrc,
                                hero_media_tipo: data.tipo,
                              }));
                              showMsg(`✓ ${isVideo ? "Video" : "Imagen"} subido correctamente. Ya se ve en la vista previa.`);
                            } catch (err) {
                              showMsg(`Error al subir: ${err.message}`, false);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>

                    {/* Vista previa */}
                    {pageConfig.hero_media_src && (
                      <div className="border border-gold/20 p-4 bg-[#0a0a0a]">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-body text-[9px] uppercase tracking-[0.4em] text-gold/50">
                            ✓ {pageConfig.hero_media_tipo === "imagen" ? "Imagen" : "Video"} actual del hero
                          </p>
                          <span className="font-body text-[9px] text-gold/40">Guardado automáticamente ✓</span>
                        </div>
                        {pageConfig.hero_media_tipo === "imagen" ? (
                          <img src={pageConfig.hero_media_src} alt="Hero" className="w-full max-h-52 object-cover grayscale rounded" />
                        ) : (
                          <video src={pageConfig.hero_media_src} className="w-full max-h-52 object-cover grayscale rounded" muted autoPlay loop playsInline />
                        )}
                        <p className="font-body text-white/20 text-xs mt-2">Así se ve en el hero de la landing (blanco y negro). Se guarda automáticamente al subir.</p>
                      </div>
                    )}

                    {/* URL externa opcional */}
                    <div className="pt-4 border-t border-white/[0.06]">
                      <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/20 mb-3">Alternativa: URL de video externo</p>
                      <div className="flex gap-3">
                        <input type="text" id="hero_url_input"
                          placeholder="https://ejemplo.com/video.mp4"
                          className={`${inputCls} flex-1 text-xs`} />
                        <button
                          onClick={async () => {
                            const url = document.getElementById("hero_url_input").value.trim();
                            if (!url) return showMsg("Escribe una URL primero.", false);
                            const tipo = url.match(/\.(mp4|webm|mov)/i) ? "video" : "imagen";
                            try {
                              await Promise.all([
                                api("/api/pagina/config", { method: "PUT", body: JSON.stringify({ clave: "hero_media_src",  valor: url  }) }),
                                api("/api/pagina/config", { method: "PUT", body: JSON.stringify({ clave: "hero_media_tipo", valor: tipo }) }),
                              ]);
                              setPageConfig(prev => ({ ...prev, hero_media_src: url, hero_media_tipo: tipo }));
                              showMsg("✓ URL guardada correctamente.");
                            } catch (err) { showMsg(err.message, false); }
                          }}
                          className="font-body text-[10px] uppercase tracking-[0.3em] border border-white/20 text-white/50 px-5 hover:border-gold/40 hover:text-gold transition-colors shrink-0">
                          Usar URL
                        </button>
                      </div>
                    </div>

                    {/* Textos */}
                    <div className="pt-4 border-t border-white/[0.06]">
                      <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 mb-5">Textos del hero</p>
                      {[
                        { key: "hero_titulo",    label: "Título principal",   placeholder: "El arte del piano" },
                        { key: "hero_subtitulo", label: "Subtítulo (dorado)", placeholder: "llevado al límite" },
                        { key: "hero_texto",     label: "Texto descriptivo",  placeholder: "Formación de élite..." },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key} className="mb-4">
                          <label className={labelCls}>{label}</label>
                          <div className="flex gap-3">
                            <input type="text" id={`cfg_${key}`}
                              defaultValue={pageConfig[key] || ""}
                              className={`${inputCls} flex-1`}
                              placeholder={placeholder} />
                            <button onClick={() => saveConfig(key, document.getElementById(`cfg_${key}`).value)}
                              className="font-body text-[10px] uppercase tracking-[0.3em] border border-gold/40 text-gold px-5 hover:bg-gold hover:text-black transition-colors shrink-0">
                              Guardar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>

                {/* Maestros */}
                <FadeIn delay={0.15} className="mb-14">
                  <h2 className="font-display text-2xl font-light mb-6">Maestros <em className="italic text-gold/70">— gestión</em></h2>

                  {/* Lista maestros */}
                  <div className="space-y-3 mb-10">
                    {maestros.map(m => (
                      <div key={m.id} className={`border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${m.activo ? "border-white/[0.06] bg-[#0a0a0a]" : "border-white/[0.03] bg-[#080808] opacity-50"}`}>
                        <div className="flex items-center gap-4 flex-1">
                          {m.foto ? (
                            <img src={m.foto} alt={m.nombre} className="w-12 h-12 rounded-full object-cover border border-gold/20 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                              <span className="font-display text-gold text-lg">{m.nombre[0]}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-display text-lg font-light">{m.nombre}</p>
                            <p className="font-body text-gold/60 text-xs">{m.rol}</p>
                            {m.origen && <p className="font-body text-white/30 text-xs">{m.origen}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button onClick={() => toggleMaestro(m)}
                            className={`font-body text-[10px] uppercase tracking-[0.3em] border px-3 py-2 transition-colors ${m.activo ? "border-white/15 text-white/40 hover:border-red-400/40 hover:text-red-400" : "border-gold/30 text-gold/60 hover:bg-gold/10"}`}>
                            {m.activo ? "Ocultar" : "Mostrar"}
                          </button>
                          <button onClick={() => setEditMaestro({...m})}
                            className="font-body text-[10px] uppercase tracking-[0.3em] border border-gold/30 text-gold/70 px-3 py-2 hover:bg-gold/10 transition-colors">
                            Editar
                          </button>
                          <button onClick={() => eliminarMaestro(m.id)}
                            className="font-body text-[10px] uppercase tracking-[0.3em] text-white/25 hover:text-red-400 transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Editar maestro */}
                  <AnimatePresence>
                    {editMaestro && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="border border-gold/20 bg-gold/[0.03] p-8 mb-8 max-w-xl">
                        <p className="font-body text-[9px] uppercase tracking-[0.4em] text-gold/60 mb-5">Editando: {editMaestro.nombre}</p>
                        <form onSubmit={guardarMaestro} className="space-y-4">
                          {[
                            { key: "nombre", label: "Nombre *", required: true },
                            { key: "rol",    label: "Especialidad" },
                            { key: "origen", label: "Ciudad, País" },
                          ].map(({ key, label, required }) => (
                            <div key={key}>
                              <label className={labelCls}>{label}</label>
                              <input type="text" required={required} value={editMaestro[key] || ""}
                                onChange={e => setEditMaestro({...editMaestro, [key]: e.target.value})}
                                className={inputCls} />
                            </div>
                          ))}
                          <div>
                            <label className={labelCls}>Foto de perfil</label>
                            <div className="flex items-center gap-4">
                              {editMaestro.foto && <img src={editMaestro.foto} className="w-12 h-12 rounded-full object-cover border border-gold/20" alt="" />}
                              <button type="button" onClick={() => fotoRef.current?.click()}
                                className="font-body text-[10px] uppercase tracking-[0.3em] border border-white/15 text-white/40 px-4 py-2 hover:border-gold/40 hover:text-gold transition-colors">
                                Cambiar foto
                              </button>
                              <input ref={fotoRef} type="file" accept="image/*" className="hidden"
                                onChange={e => handleFotoMaestro(e, setEditMaestro)} />
                            </div>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button type="submit" className="bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] px-8 py-3 hover:bg-yellow-300 transition-colors">
                              Guardar cambios
                            </button>
                            <button type="button" onClick={() => setEditMaestro(null)}
                              className="font-body text-[10px] uppercase tracking-[0.3em] border border-white/15 text-white/40 px-6 py-3 hover:border-white/30 transition-colors">
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Agregar nuevo maestro */}
                  <div className="border border-white/[0.06] p-8 max-w-xl">
                    <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 mb-5">Agregar nuevo maestro</p>
                    <form onSubmit={crearMaestro} className="space-y-4">
                      {[
                        { key: "nombre", label: "Nombre *", required: true },
                        { key: "rol",    label: "Especialidad" },
                        { key: "origen", label: "Ciudad, País" },
                      ].map(({ key, label, required }) => (
                        <div key={key}>
                          <label className={labelCls}>{label}</label>
                          <input type="text" required={required} value={maestroForm[key] || ""}
                            onChange={e => setMaestroForm({...maestroForm, [key]: e.target.value})}
                            className={inputCls} placeholder={label.replace(" *","")} />
                        </div>
                      ))}
                      <button type="submit" className="font-body text-[10px] uppercase tracking-[0.4em] border border-gold/40 text-gold px-8 py-3 hover:bg-gold hover:text-black transition-colors">
                        Agregar maestro
                      </button>
                    </form>
                  </div>
                </FadeIn>
              </motion.div>
            )}

            {/* ── ALUMNOS ── */}
            {tab === "alumnos" && (
              <motion.div key="alumnos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <h1 className="font-display font-light text-4xl mb-2">Estudiantes <em className="italic text-gold">registrados</em></h1>
                  <p className="font-body text-white/35 text-sm mb-8">{alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""}.</p>
                </FadeIn>
                {loading ? <p className="font-body text-white/30 text-sm">Cargando...</p>
                : alumnos.length === 0 ? <p className="font-body text-white/30 text-sm">No hay alumnos aún.</p>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="text-[10px] uppercase tracking-[0.3em] text-white/25 border-b border-white/[0.06]">
                        <tr>
                          <th className="py-3 pr-6">Nombre</th>
                          <th className="py-3 pr-6">Email</th>
                          <th className="py-3">Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumnos.map(a => (
                          <tr key={a.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pr-6 font-display text-base font-light">{a.nombre}</td>
                            <td className="py-4 pr-6 text-white/50">{a.email}</td>
                            <td className="py-4 text-white/30 text-xs">{new Date(a.created_at).toLocaleDateString("es-CO")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── RESERVAS ── */}
            {tab === "reservas" && (
              <motion.div key="reservas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <h1 className="font-display font-light text-4xl mb-2">Todas las <em className="italic text-gold">reservas</em></h1>
                  <p className="font-body text-white/35 text-sm mb-8">{reservas.length} reserva{reservas.length !== 1 ? "s" : ""}.</p>
                </FadeIn>
                {loading ? <p className="font-body text-white/30 text-sm">Cargando...</p>
                : reservas.length === 0 ? <p className="font-body text-white/30 text-sm">No hay reservas aún.</p>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="text-[10px] uppercase tracking-[0.3em] text-white/25 border-b border-white/[0.06]">
                        <tr>
                          <th className="py-3 pr-6">Clase</th>
                          <th className="py-3 pr-6">Alumno</th>
                          <th className="py-3 pr-6">Fecha</th>
                          <th className="py-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservas.map(r => (
                          <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pr-6 font-display text-base font-light">{r.titulo}</td>
                            <td className="py-4 pr-6 text-white/50">{r.alumno}</td>
                            <td className="py-4 pr-6 text-white/35 text-xs">{formatFecha(r.fecha)}</td>
                            <td className="py-4">
                              <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold/60 border border-gold/20 px-2 py-1">{r.estado}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── CONTACTOS ── */}
            {tab === "contactos" && (
              <motion.div key="contactos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <h1 className="font-display font-light text-4xl mb-2">Mensajes de <em className="italic text-gold">contacto</em></h1>
                  <p className="font-body text-white/35 text-sm mb-8">{noLeidos} sin leer · {contactos.length} total.</p>
                </FadeIn>
                {loading ? <p className="font-body text-white/30 text-sm">Cargando...</p>
                : contactos.length === 0 ? <p className="font-body text-white/30 text-sm">No hay mensajes.</p>
                : (
                  <div className="space-y-3">
                    {contactos.map((c, i) => (
                      <FadeIn key={c.id} delay={i * 0.03}>
                        <div className={`border p-6 ${c.leido ? "border-white/[0.04] bg-[#0a0a0a]" : "border-gold/20 bg-gold/[0.03]"}`}>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                {!c.leido && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
                                <p className="font-display text-lg font-light">{c.nombre}</p>
                              </div>
                              <p className="font-body text-gold/70 text-sm">{c.email}</p>
                              <div className="flex gap-3 mt-2 flex-wrap">
                                {c.programa && <span className="font-body text-[10px] uppercase tracking-[0.25em] text-white/30 border border-white/10 px-2 py-1">{c.programa}</span>}
                                {c.nivel && <span className="font-body text-[10px] uppercase tracking-[0.25em] text-white/30 border border-white/10 px-2 py-1">{c.nivel}</span>}
                              </div>
                              {c.mensaje && <p className="font-body text-white/40 text-sm mt-3 leading-relaxed">{c.mensaje}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-3 shrink-0">
                              <p className="font-body text-white/20 text-xs">{new Date(c.created_at).toLocaleDateString("es-CO")}</p>
                              {!c.leido && (
                                <button onClick={() => marcarLeido(c.id)}
                                  className="font-body text-[10px] uppercase tracking-[0.3em] text-gold/60 hover:text-gold transition-colors">
                                  Marcar leído
                                </button>
                              )}
                              <a href={`mailto:${c.email}`}
                                className="font-body text-[10px] uppercase tracking-[0.3em] border border-gold/30 text-gold px-4 py-2 hover:bg-gold hover:text-black transition-colors">
                                Responder
                              </a>
                            </div>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </DashboardLayout>
  );
}
