export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#4F46E5",
          secondary: "#7C3AED",
          accent: "#06B6D4",
          surface: "#F8FAFC",
        },
      },
      boxShadow: {
        glow: "0 24px 80px rgba(79, 70, 229, 0.22)",
        premium: "0 24px 70px rgba(15, 23, 42, 0.10)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.55 },
          "50%": { opacity: 1 },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        pulseSoft: "pulseSoft 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
