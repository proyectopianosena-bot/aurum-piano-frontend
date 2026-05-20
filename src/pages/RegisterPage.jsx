import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import VerificationCodeInput from "../components/VerificationCodeInput";
import { api } from "../lib/api";

const inputClass =
  "w-full bg-transparent border-b border-white/15 text-white font-body font-light text-sm py-4 placeholder-white/25 focus:outline-none focus:border-gold transition-colors duration-300";

export default function RegisterPage() {
  const { confirmRegister, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const sendCode = async (e) => {
    e?.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await api("/api/auth/register/send-code", {
        method: "POST",
        body: JSON.stringify({ nombre, email, password }),
      });
      setStep(2);
      setInfo(data.devNote || "Revisa tu bandeja de entrada (y spam).");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await confirmRegister(email, code);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      subtitle={step === 1 ? "Nuevo estudiante" : "Verificación"}
      title={
        step === 1 ? (
          <>Únete a <em className="italic text-gold">Aurum</em></>
        ) : (
          <>Confirma tu <em className="italic text-gold">email</em></>
        )
      }
    >
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            onSubmit={sendCode}
            className="space-y-8"
          >
            <div>
              <label className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 block mb-2">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputClass} placeholder="Tu nombre" />
            </div>
            <div>
              <label className="font-body text-[9px] uppercase tracking-[0.4em] text-white/30 block mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="tu@email.com" />
            </div>
            <PasswordField label="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            {error && <p className="font-body text-sm text-red-400/80">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] py-5 hover:bg-yellow-300 transition-colors disabled:opacity-50">
              {loading ? "Enviando código..." : "Enviar código de verificación"}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="verify"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            onSubmit={verify}
            className="space-y-8"
          >
            <p className="font-body text-white/40 text-sm leading-relaxed">
              Enviamos un código de 6 dígitos a <span className="text-gold">{email}</span>
            </p>
            {info && <p className="font-body text-white/30 text-xs leading-relaxed border-l border-gold/30 pl-4">{info}</p>}
            <VerificationCodeInput value={code} onChange={setCode} disabled={loading} />
            {error && <p className="font-body text-sm text-red-400/80">{error}</p>}
            <button type="submit" disabled={loading || code.length !== 6} className="w-full bg-gold text-black font-body text-[10px] uppercase tracking-[0.4em] py-5 hover:bg-yellow-300 transition-colors disabled:opacity-50">
              {loading ? "Verificando..." : "Activar cuenta"}
            </button>
            <button type="button" onClick={sendCode} disabled={loading} className="w-full font-body text-[10px] uppercase tracking-[0.35em] text-white/40 hover:text-gold transition-colors">
              Reenviar código
            </button>
            <button type="button" onClick={() => { setStep(1); setCode(""); setError(""); }} className="w-full font-body text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-white/50 transition-colors">
              ← Cambiar datos
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="font-body text-white/35 text-sm mt-10">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-gold hover:text-gold-light transition-colors">Inicia sesión</Link>
      </p>
      <Link to="/" className="inline-block mt-6 font-body text-[10px] uppercase tracking-[0.35em] text-white/25 hover:text-gold transition-colors">
        ← Volver al inicio
      </Link>
    </AuthLayout>
  );
}
