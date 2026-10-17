import localFont from "next/font/local";

// Vazir v16.1.0 (provided locally, bundled with the app; SIL OFL / Apache — see src/fonts/LICENSE-Vazir.txt)
export const vazir = localFont({
  variable: "--font-vazir",
  display: "swap",
  src: [
    { path: "../fonts/Vazir-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/Vazir.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Vazir-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Vazir-Bold.woff2", weight: "700", style: "normal" },
  ],
  fallback: ["Tahoma", "system-ui", "sans-serif"],
});

// Latin display face used only for the SHOMAAA wordmark and numerals in headlines (Cormorant Garamond, OFL)
export const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "../fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  fallback: ["Georgia", "serif"],
});
