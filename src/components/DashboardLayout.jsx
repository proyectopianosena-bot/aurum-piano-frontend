import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/[0.06] px-6 md:px-10 py-5 flex items-center justify-between gap-4 sticky top-0 z-30 bg-[#080808]/95 backdrop-blur-xl">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-[0.4em] text-gold">AURUM</span>
          <span className="font-body text-[8px] tracking-[0.45em] uppercase text-white/30">Piano Academy</span>
        </Link>
        <div className="flex items-center gap-6">
          {user?.role === "admin" && (
            <span className="font-body text-[9px] uppercase tracking-[0.35em] text-gold/50 border border-gold/20 px-3 py-1 hidden sm:block">
              Admin
            </span>
          )}
          <span className="font-body text-[10px] uppercase tracking-[0.25em] text-white/35 hidden sm:block">
            {user?.nombre}
          </span>
          <button type="button" onClick={logout}
            className="font-body text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-gold transition-colors">
            Salir
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
