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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { user, updateAvatar } = useAuth();
  const [tab, setTab] = useState("inicio");
  const [clases, setClases] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const [c, r] = await Promise.all([api("/api/clases"), api("/api/reservas/mias")]);
      setClases(c.clases || []);
      setReservas(r.reservas || []);
    } catch (err) {
      setMsg({ text: err.message, ok: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  };

  const reservar = async (claseId) => {
    try {
      await api("/api/reservas", { method: "POST", body: JSON.stringify({ clase_id: claseId }) });
      showMsg("Reserva confirmada.");
      load();
    } catch (err) { showMsg(err.message, false); }
  };

  const cancelar = async (id) => {
    try {
      await api(`/api/reservas/${id}`, { method: "DELETE" });
      showMsg("Reserva cancelada.");
      load();
    } catch (err) { showMsg(err.message, false); }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showMsg("La imagen no puede superar 2MB.", false);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = await api("/api/auth/avatar", {
          method: "POST",
          body: JSON.stringify({ avatar: ev.target.result }),
        });
        if (updateAvatar) updateAvatar(data.avatar);
        showMsg("Foto actualizada.");
      } catch { showMsg("No se pudo subir la foto.", false); }
      finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  const initials = user?.nombre?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "A";
  const reservaIds = new Set(reservas.map(r => r.clase_id));

  const tabs = [
    { id: "inicio",   label: "Inicio" },
    { id: "clases",   label: "Clases" },
    { id: "reservas", label: "Mis reservas" },
    { id: "perfil",   label: "Mi perfil" },
  ];

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-73px)]">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r border-white/[0.06] px-6 py-10 shrink-0">
          <div className="flex flex-col items-center mb-10">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-gold/30" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <span className="font-display text-2xl text-gold font-light">{initials}</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[9px] uppercase tracking-widest">{uploading ? "..." : "Cambiar"}</span>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            <p className="font-display text-base font-light mt-3 text-center leading-tight">{user?.nombre}</p>
            <p className="font-body text-[9px] uppercase tracking-[0.3em] text-gold/60 mt-1">Estudiante</p>
          </div>
          <nav className="space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full text-left font-body text-[11px] uppercase tracking-[0.3em] px-3 py-3 transition-all duration-200 ${
                  tab === t.id ? "text-gold border-l-2 border-gold pl-4" : "text-white/35 hover:text-white/70"
                }`}>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-4 border-b border-white/[0.06] absolute left-0 right-0" style={{top:73}}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`shrink-0 font-body text-[10px] uppercase tracking-[0.3em] px-4 py-2 border transition-colors ${
                tab === t.id ? "bg-gold text-black border-gold" : "border-white/10 text-white/40"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <main className="flex-1 px-6 md:px-12 py-10">
          <AnimatePresence mode="wait">

            {tab === "inicio" && (
              <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <p className="font-body text-[9px] uppercase tracking-[0.4em] text-gold mb-2">Bienvenido de nuevo</p>
                  <h1 className="font-display font-light text-4xl md:text-5xl mb-2">
                    Hola, <em className="italic text-gold">{user?.nombre?.split(" ")[0]}</em>
                  </h1>
                  <p className="font-body font-light text-white/35 text-sm mb-10">Continúa tu camino musical.</p>
                </FadeIn>
                <FadeIn delay={0.1} className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/[0.04] mb-10">
                  {[
                    { n: reservas.length, label: "Clases reservadas" },
                    { n: clases.length,   label: "Clases disponibles" },
                    { n: "—",            label: "Lecciones completadas" },
                  ].map(({ n, label }) => (
                    <div key={label} className="bg-[#0a0a0a] p-8 text-center">
                      <span className="font-display text-4xl text-gold font-light block mb-2">{n}</span>
                      <span className="font-body text-[10px] uppercase tracking-[0.25em] text-white/30">{label}</span>
                    </div>
                  ))}
                </FadeIn>
                <FadeIn delay={0.2}>
                  <h2 className="font-display text-2xl font-light mb-5">Próximas <em className="italic text-gold">clases</em></h2>
                  {loading ? <p className="font-body text-white/30 text-sm">Cargando...</p>
                  : reservas.length === 0 ? (
                    <div className="border border-white/[0.06] p-8 text-center">
                      <p className="font-body text-white/35 text-sm mb-4">No tienes clases reservadas.</p>
                      <button onClick={() => setTab("clases")} className="font-body text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/40 px-6 py-3 hover:bg-gold hover:text-black transition-colors">
                        Explorar clases
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {reservas.slice(0, 3).map(r => (
                        <li key={r.id} className="border border-white/[0.06] p-5 bg-[#0a0a0a] flex justify-between items-center gap-4">
                          <div>
                            <p className="font-display text-lg font-light">{r.titulo}</p>
                            <p className="font-body text-white/35 text-xs mt-1">{formatFecha(r.fecha)}</p>
                          </div>
                          <span className="font-body text-[9px] uppercase tracking-[0.3em] text-gold/50 border border-gold/20 px-3 py-1 shrink-0">Confirmada</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </FadeIn>
              </motion.div>
            )}

            {tab === "clases" && (
              <motion.div key="clases" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <h1 className="font-display font-light text-4xl mb-2">Clases <em className="italic text-gold">disponibles</em></h1>
                  <p className="font-body text-white/35 text-sm mb-8">Reserva tu lugar en las próximas sesiones.</p>
                </FadeIn>
                {msg.text && <p className={`font-body text-sm mb-6 ${msg.ok ? "text-gold" : "text-red-400/80"}`}>{msg.text}</p>}
                {loading ? <p className="font-body text-white/30 text-sm">Cargando...</p>
                : clases.length === 0 ? (
                  <div className="border border-white/[0.06] p-12 text-center">
                    <p className="font-body text-white/35 text-sm">Aún no hay clases publicadas.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {clases.map((c, i) => {
                      const yaReservado = reservaIds.has(c.id);
                      return (
                        <FadeIn key={c.id} delay={i * 0.05}>
                          <div className={`border p-6 bg-[#0a0a0a] h-full flex flex-col justify-between ${yaReservado ? "border-gold/20" : "border-white/[0.06]"}`}>
                            <div>
                              {yaReservado && <span className="font-body text-[9px] uppercase tracking-[0.3em] text-gold border border-gold/30 px-2 py-1 inline-block mb-3">Reservada</span>}
                              <p className="font-display text-xl font-light">{c.titulo}</p>
                              {c.descripcion && <p className="font-body text-white/35 text-sm mt-2 leading-relaxed">{c.descripcion}</p>}
                              <div className="mt-4 space-y-1">
                                <p className="font-body text-white/40 text-xs">{formatFecha(c.fecha)}</p>
                                {c.maestro && <p className="font-body text-white/30 text-xs">Maestro: {c.maestro}</p>}
                              </div>
                              <p className="font-body text-[10px] uppercase tracking-[0.25em] text-gold/50 mt-3">{c.cupos_disponibles} cupo{c.cupos_disponibles !== 1 ? "s" : ""}</p>
                            </div>
                            <button type="button" disabled={c.cupos_disponibles < 1 || yaReservado} onClick={() => reservar(c.id)}
                              className="mt-5 font-body text-[10px] uppercase tracking-[0.35em] border border-gold/40 text-gold px-4 py-3 hover:bg-gold hover:text-black transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                              {yaReservado ? "Ya reservada" : c.cupos_disponibles < 1 ? "Sin cupos" : "Reservar"}
                            </button>
                          </div>
                        </FadeIn>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "reservas" && (
              <motion.div key="reservas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <h1 className="font-display font-light text-4xl mb-2">Mis <em className="italic text-gold">reservas</em></h1>
                  <p className="font-body text-white/35 text-sm mb-8">Tus clases confirmadas.</p>
                </FadeIn>
                {msg.text && <p className={`font-body text-sm mb-6 ${msg.ok ? "text-gold" : "text-red-400/80"}`}>{msg.text}</p>}
                {loading ? <p className="font-body text-white/30 text-sm">Cargando...</p>
                : reservas.length === 0 ? (
                  <div className="border border-white/[0.06] p-12 text-center">
                    <p className="font-body text-white/35 text-sm mb-4">No tienes reservas activas.</p>
                    <button onClick={() => setTab("clases")} className="font-body text-[10px] uppercase tracking-[0.35em] text-gold border border-gold/40 px-6 py-3 hover:bg-gold hover:text-black transition-colors">Ver clases</button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {reservas.map((r, i) => (
                      <FadeIn key={r.id} delay={i * 0.05}>
                        <li className="border border-white/[0.06] p-6 bg-[#0a0a0a] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="font-display text-xl font-light">{r.titulo}</p>
                            <p className="font-body text-white/35 text-xs mt-1">{formatFecha(r.fecha)}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-body text-[9px] uppercase tracking-[0.3em] text-gold/50 border border-gold/20 px-3 py-1">Confirmada</span>
                            <button type="button" onClick={() => cancelar(r.id)} className="font-body text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-red-400 transition-colors">Cancelar</button>
                          </div>
                        </li>
                      </FadeIn>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {tab === "perfil" && (
              <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeIn>
                  <h1 className="font-display font-light text-4xl mb-2">Mi <em className="italic text-gold">perfil</em></h1>
                  <p className="font-body text-white/35 text-sm mb-10">Tu información de estudiante.</p>
                </FadeIn>
                <FadeIn delay={0.1} className="max-w-md">
                  <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/[0.06]">
                    <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                      {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border border-gold/30" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                          <span className="font-display text-4xl text-gold font-light">{initials}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[9px] uppercase tracking-widest text-center px-2">{uploading ? "Subiendo..." : "Cambiar foto"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-light">{user?.nombre}</p>
                      <p className="font-body text-white/35 text-sm mt-1">{user?.email}</p>
                      <p className="font-body text-[9px] uppercase tracking-[0.3em] text-gold/50 mt-2">Estudiante Aurum</p>
                    </div>
                  </div>
                  {msg.text && <p className={`font-body text-sm mb-6 ${msg.ok ? "text-gold" : "text-red-400/80"}`}>{msg.text}</p>}
                  <div className="space-y-6">
                    {[{ label: "Nombre", value: user?.nombre }, { label: "Email", value: user?.email }, { label: "Rol", value: "Estudiante" }].map(({ label, value }) => (
                      <div key={label}>
                        <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/25 mb-2">{label}</p>
                        <p className="font-body text-white/70 text-sm border-b border-white/[0.06] pb-3">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 pt-10 border-t border-white/[0.06]">
                    <button onClick={() => fileRef.current?.click()} className="font-body text-[10px] uppercase tracking-[0.35em] border border-white/15 text-white/50 px-6 py-3 hover:border-gold/50 hover:text-gold transition-colors">
                      {uploading ? "Subiendo..." : "Cambiar foto de perfil"}
                    </button>
                    <p className="font-body text-white/20 text-xs mt-3">Máximo 2MB. JPG o PNG.</p>
                  </div>
                </FadeIn>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </DashboardLayout>
  );
}
