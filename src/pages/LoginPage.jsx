import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";

const inputClass =
  "w-full bg-transparent border-b border-white/15 text-white font-body font-light text-sm py-4 placeholder-white/25 focus:outline-none focus:border-gold transition-colors duration-300";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMsg = location.state?.message;

  // Si ya está logueado, redirigir directamente sin return null
  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Área privada" title={<>Bienvenido de <em className="italic text-gold">nuevo</em></>}>
      {successMsg && (
        <p className="font-body text-sm text-gold/90 border-l border-gold/40 pl-4 mb-8 -mt-4">{successMsg}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 block mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="tu@email.com" autoComplete="email" />
        </div>
        <PasswordField label="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="font-body text-[10px] uppercase tracking-[0.3em] text-white/35 hover:text-gold transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {error && <p className="font-body text-sm text-red-400/80">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] py-5 hover:bg-yellow-300 transition-colors disabled:opacity-50">
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>
      </form>
      <p className="font-body text-white/35 text-sm mt-10">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-gold hover:text-gold-light transition-colors">Regístrate</Link>
      </p>
      <Link to="/" className="inline-block mt-6 font-body text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-gold transition-colors">
        ← Volver al inicio
      </Link>
    </AuthLayout>
  );
}
