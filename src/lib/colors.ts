// Colour swatches by WooCommerce term slug (pa_color terms are created as "color-<id>").
export const COLOR_HEX: Record<string, string> = {
  charcoal: "#3a3a3c", navy: "#1f2a44", grey: "#9a9a98", black: "#161616", brown: "#5b4030",
  ivory: "#efe7d6", olive: "#5e624a", cream: "#e9dcc3", beige: "#c9b08a", emerald: "#0f5a48",
  champagne: "#d8c3a0", taupe: "#8b7b6b", white: "#fafaf7", blue: "#a9c1dc", burgundy: "#5c1a2b",
  brass: "#b08d4a", tan: "#a8743f",
};
export const colorHex = (slug: string) => COLOR_HEX[slug.replace(/^color-/, "")] ?? "#bdb6a8";
