import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import VerificationCodeInput from "../components/VerificationCodeInput";
import { api } from "../lib/api";

const inputClass =
  "w-full bg-transparent border-b border-white/15 text-white font-body font-light text-sm py-4 placeholder-white/25 focus:outline-none focus:border-gold transition-colors duration-300";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (code.length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, password }),
      });
      navigate("/login", { state: { message: "Contraseña actualizada. Inicia sesión." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Nueva clave" title={<>Crea una <em className="italic text-gold">contraseña</em></>}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 block mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="tu@email.com" />
        </div>
        <div>
          <p className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 mb-3">Código de verificación</p>
          <VerificationCodeInput value={code} onChange={setCode} disabled={loading} />
        </div>
        <PasswordField label="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} autoComplete="new-password" />
        <PasswordField label="Confirmar contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} autoComplete="new-password" />
        {error && <p className="font-body text-sm text-red-400/80">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] py-5 hover:bg-yellow-300 transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Actualizar contraseña"}
        </button>
      </form>
      <Link to="/forgot-password" className="inline-block mt-8 font-body text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-gold transition-colors">
        Reenviar código
      </Link>
    </AuthLayout>
  );
}
