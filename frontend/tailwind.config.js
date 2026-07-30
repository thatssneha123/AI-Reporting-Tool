export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0f6e56",
          secondary: "#085041",
          accent: "#e1f5ee",
          surface: "#faf9f6",
        },
        report: {
          page: "#faf9f6",
          surface: "#fffefb",
          border: "#e5e1d8",
          strongBorder: "#cfcbb8",
          primary: "#04342c",
          secondary: "#3a3a35",
          muted: "#8b8a80",
          accent: "#0f6e56",
          accentHover: "#085041",
          accentLight: "#e1f5ee",
          accentBorder: "#9fe1cb",
          warningBg: "#faece7",
          warningBorder: "#f0997b",
          warningText: "#712b13",
        },
      },
      boxShadow: {
        glow: "none",
        premium: "none",
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
