import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../lib/api";

const inputClass =
  "w-full bg-transparent border-b border-white/15 text-white font-body font-light text-sm py-4 placeholder-white/25 focus:outline-none focus:border-gold transition-colors duration-300";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setInfo(data.message + (data.devNote ? ` ${data.devNote}` : ""));
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Recuperación" title={<>¿Olvidaste tu <em className="italic text-gold">clave</em>?</>}>
      <p className="font-body text-white/40 text-sm leading-relaxed mb-8 -mt-4">
        Te enviaremos un código de verificación a tu correo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 block mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="tu@email.com" />
        </div>
        {error && <p className="font-body text-sm text-red-400/80">{error}</p>}
        {info && <p className="font-body text-sm text-gold/80 border-l border-gold/30 pl-4">{info}</p>}
        <button type="submit" disabled={loading} className="w-full bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] py-5 hover:bg-yellow-300 transition-colors disabled:opacity-50">
          {loading ? "Enviando..." : "Enviar código"}
        </button>
      </form>
      <Link to="/login" className="inline-block mt-8 font-body text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-gold transition-colors">
        ← Volver al login
      </Link>
    </AuthLayout>
  );
}
