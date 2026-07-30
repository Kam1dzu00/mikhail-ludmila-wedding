import sharp from "sharp";

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veil" x1="0" x2="1">
      <stop stop-color="#f4f0e8" stop-opacity="0.94"/>
      <stop offset="0.55" stop-color="#f4f0e8" stop-opacity="0.62"/>
      <stop offset="1" stop-color="#123447" stop-opacity="0.76"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#veil)"/>
  <rect x="54" y="54" width="1092" height="522" rx="18" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.55)"/>
  <text x="84" y="176" font-family="Georgia, serif" font-size="84" fill="#123447" font-weight="700">Михаил &amp; Невеста</text>
  <text x="88" y="252" font-family="Arial, sans-serif" font-size="34" fill="#123447" font-weight="700">Похоже, у нас всё серьёзно</text>
  <text x="88" y="508" font-family="Arial, sans-serif" font-size="28" fill="#f4f0e8" font-weight="700">Крым · море · камерная свадьба</text>
</svg>`;

await sharp("public/images/favorite-mirror-gallery.jpg")
  .resize(1200, 630, { fit: "cover", position: "center" })
  .modulate({ brightness: 0.82, saturation: 0.88 })
  .composite([{ input: Buffer.from(svg), blend: "over" }])
  .png()
  .toFile("public/og.png");
