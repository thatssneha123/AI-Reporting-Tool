import { useRef } from "react";

export default function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  const setDigit = (index, nextValue) => {
    const digit = nextValue.replace(/\D/g, "").slice(-1);
    const next = digits.map((item) => (item === " " ? "" : item));
    next[index] = digit;
    onChange(next.join("").slice(0, 6));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => { refs.current[index] = node; }}
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()}
          onPaste={handlePaste}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index].trim() && index > 0) refs.current[index - 1]?.focus();
          }}
          className="aspect-square rounded-lg border-2 border-[var(--border)] bg-white text-center text-xl font-black text-[var(--text-primary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)] outline-none transition focus:border-[var(--accent)] focus:shadow-[4px_4px_0_rgba(17,24,39,0.9)]"
        />
      ))}
    </div>
  );
}
