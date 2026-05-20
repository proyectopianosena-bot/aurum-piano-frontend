import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      <header className="px-8 py-6 border-b border-white/[0.06]">
        <Link to="/" className="inline-flex flex-col leading-none group">
          <span className="font-display text-2xl font-light tracking-[0.45em] text-gold group-hover:opacity-80 transition-opacity">
            AURUM
          </span>
          <span className="font-body text-[9px] tracking-[0.5em] uppercase text-white/40 mt-0.5">
            Piano Academy
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <p className="font-body uppercase tracking-[0.4em] text-xs text-gold mb-4">{subtitle}</p>
          <h1 className="font-display font-light text-4xl md:text-5xl mb-10 leading-tight">
            {title}
          </h1>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
