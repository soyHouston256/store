// Siluetas de polo (viewBox 0 0 200 200) usadas en el diseño como placeholder
// hasta tener fotos reales, y en los íconos del selector de corte.
export const SILUETA = {
  hombre: {
    frente: 'M62 18 L80 10 Q100 24 120 10 L138 18 L182 46 L164 80 L146 70 L146 190 L54 190 L54 70 L36 80 L18 46 Z',
    espalda: 'M62 18 L80 14 Q100 18 120 14 L138 18 L182 46 L164 80 L146 70 L146 190 L54 190 L54 70 L36 80 L18 46 Z',
  },
  mujer: {
    frente: 'M70 20 L86 12 Q100 24 114 12 L130 20 L162 40 L150 64 L138 60 Q132 96 140 128 L144 188 L56 188 L60 128 Q68 96 62 60 L50 64 L38 40 Z',
    espalda: 'M70 20 L86 15 Q100 19 114 15 L130 20 L162 40 L150 64 L138 60 Q132 96 140 128 L144 188 L56 188 L60 128 Q68 96 62 60 L50 64 L38 40 Z',
  },
} as const;

// Ícono del selector: <svg viewBox="0 0 200 200"><path d={SILUETA[corte].frente} fill="none" stroke="currentColor" strokeWidth={10} strokeLinejoin="round"/></svg>
