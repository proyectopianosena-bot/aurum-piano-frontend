import { useRef } from "react";

export default function VerificationCodeInput({ value, onChange, disabled }) {
  const inputsRef = useRef([]);
  const digits = (value + "      ").slice(0, 6).split("");

  const update = (index, char) => {
    if (char && !/^\d$/.test(char)) return;
    const next = [...digits.map((d) => d.trim() || "")];
    next[index] = char;
    const joined = next.join("").slice(0, 6);
    onChange(joined);
    if (char && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const onKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-between" onPaste={onPaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digits[i]?.trim() || ""}
          onChange={(e) => update(i, e.target.value.slice(-1))}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="w-11 sm:w-12 h-14 text-center font-display text-2xl text-gold bg-[#0a0a0a] border border-white/10 focus:border-gold focus:outline-none transition-colors disabled:opacity-40"
        />
      ))}
    </div>
  );
}
