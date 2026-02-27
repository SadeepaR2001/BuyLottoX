/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blx: {
          bg: "#050308",
          panel: "rgba(255,255,255,0.04)",
          border: "rgba(168,85,247,0.35)",
          purple: "#a855f7",
          purple2: "#7c3aed",
          text: "#eae7ff",
          muted: "rgba(234,231,255,0.68)",
        },
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(168,85,247,0.35), 0 0 24px rgba(168,85,247,0.25)",
        neonStrong: "0 0 0 1px rgba(168,85,247,0.45), 0 0 32px rgba(168,85,247,0.35)",
      },
      backgroundImage: {
        "panel-sparkle":
          "radial-gradient(600px circle at 10% 10%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(700px circle at 90% 30%, rgba(124,58,237,0.12), transparent 55%), radial-gradient(500px circle at 50% 110%, rgba(168,85,247,0.10), transparent 60%)",
      },
    },
  },
  plugins: [],
}
