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
          className="aspect-square rounded-lg border border-[#2a2a4a] bg-[#0f0f1a] text-center text-xl font-bold text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
      ))}
    </div>
  );
}
