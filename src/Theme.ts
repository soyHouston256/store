import { createGlobalStyle } from 'styled-components';

// devhaus.pe — design tokens (docs/devhaus-handoff/brand/tokens.css) + re-mapeo
// de las variables `--color-*` históricas para que los componentes existentes
// hereden la marca sin tocarlos (design §3.1, decisión A1).
//
// El tema oscuro sigue mandando desde `body.dark-theme` (ThemeSwitch.tsx).
// Las variables `--color-*` se declaran tanto en `:root` como en `.dark-theme`
// porque `var()` dentro de una custom property se resuelve en el elemento que
// la declara: si solo estuvieran en `:root`, la sobreescritura de `--dh-*` en
// `body.dark-theme` no las re-evaluaría.

const colorMapping = `
    --color-background: var(--dh-bg);
    --color-neutral: var(--dh-surface);
    --color-text: var(--dh-ink);
    --color-text-invert: var(--dh-on-dark);
    --color-accent: var(--dh-accent);
    --color-accent-light: var(--dh-sand);
    --color-surface: var(--dh-surface);
    --color-surface-light: var(--dh-sand-2);
    --color-border: var(--dh-line);
    --color-border-dark: var(--dh-line-2);
    --color-border-solid: var(--dh-line-2);
    --color-warning: var(--dh-yellow);
    --color-warning-light: var(--dh-sand);
`

export const GlobalStyles = createGlobalStyle`
  :root {
    /* ---- devhaus tokens: color ---- */
    --dh-ink: #1B1A17;          /* texto principal, botones primarios, fondo oscuro */
    --dh-ink-2: #4A4640;        /* párrafos */
    --dh-muted: #5E5A53;        /* texto secundario (contraste AA sobre crema) */
    --dh-bg: #FAF6F1;           /* fondo de página */
    --dh-surface: #FFFFFF;      /* tarjetas */
    --dh-sand: #F3ECE2;         /* fondo de imagen de producto, hero */
    --dh-sand-2: #EFE8DE;       /* footer, segmented controls */
    --dh-line: #E7E1D8;         /* bordes de tarjeta */
    --dh-line-2: #D8D0C4;       /* bordes de inputs / chips */
    --dh-accent: #D2432F;       /* CTA "Agregar al carrito", merge del logo */
    --dh-accent-hover: #B8382A;
    --dh-yellow: #E9B949;       /* HEAD del logo, destacados */
    --dh-yellow-dark: #D9A62E;  /* HEAD sobre fondos claros del logo invertido */
    --dh-sage: #CFE0D7;
    --dh-green: #6E9A86;
    --dh-on-dark: #FAF6F1;
    --dh-on-dark-muted: #BDB5A9;

    /* ---- devhaus tokens: tipografía ---- */
    --dh-font-display: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif;
    --dh-font-body: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
    --dh-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    --dh-text-hero: 64px;       /* h1, 800, tracking -0.03em, line-height 1.02 */
    --dh-text-h2: 40px;         /* 800, tracking -0.02em */
    --dh-text-h3: 26px;         /* 700 */
    --dh-text-body: 16px;
    --dh-text-small: 14px;
    --dh-text-caption: 13px;

    /* ---- devhaus tokens: radios ---- */
    --dh-radius-pill: 999px;
    --dh-radius-xl: 28px;       /* hero, bloques grandes */
    --dh-radius-lg: 20px;       /* tarjetas */
    --dh-radius-md: 14px;
    --dh-radius-sm: 12px;

    /* ---- devhaus tokens: espaciado (múltiplos de 4) ---- */
    --dh-page-x: 64px;          /* 32px en tablet (@media 1024), 16px en móvil (@media 640) */
    --dh-section-y: 80px;
    --dh-gap: 20px;

    /* ---- devhaus tokens: tamaños táctiles ---- */
    --dh-control-h: 44px;
    --dh-cta-h: 52px;

    /* ---- layout ---- */
    --screen-desktop: min(1152px, calc(100% - 2 * var(--dh-page-x)));

    /* ---- escala tipográfica heredada (componentes existentes) ---- */
    --font-size-title: 28px;
    --font-size-title_sm: 20px;
    --font-size-text: 16px;
    --font-size-price: 18px;
    --font-size-price_xl: 24px;
    --button-height: 40px;
    --button-radius: 25px;
    --radius: 16px;
    --shadow: 0px 4px 20px rgba(0, 0, 0, 0.01);
    --shadow-dark: 0px 4px 25px rgba(0, 0, 0, 0.04);
    --color-error: #ca4a4a;
    ${colorMapping}
  }
  .dark-theme {
    --dh-bg: #121110;
    --dh-surface: #1B1A17;
    --dh-sand: #24221F;
    --dh-sand-2: #1F1D1A;
    --dh-line: #2E2C28;
    --dh-line-2: #3A3833;
    --dh-ink: #FAF6F1;
    --dh-ink-2: #D8D2C8;
    --dh-muted: #A8A196;
    --dh-accent: #E0553F;
    --color-error: #c44747;
    ${colorMapping}
    --color-text-invert: #1B1A17;
  }

  @media screen and (max-width: 1024px){
    :root {
      --font-size-title: 24px;
      --font-size-price: 16px;
      --font-size-text: 15px;
      --font-size-price_xl: 20px;
      --font-size-title_sm: 18px;
    }
  }
  @media screen and (max-width: 1024px){
    :root {
      --dh-page-x: 32px;        /* tablet 641–1024 (spec R2.5) */
    }
  }
  @media screen and (max-width: 640px){
    :root {
      --dh-page-x: 16px;
    }
  }
  @media screen and (max-width: 425px){
    :root {
      --shadow-dark: 0px 10px 120px rgba(0, 0, 0, 0.2);
    }
  }
`;
