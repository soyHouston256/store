import { createGlobalStyle } from 'styled-components';

const themes: any = {
  Light: {
    background: '#FCF7F4',
    neutral: '#FFF',
    neutralLight: '#f4f4f4',
    color: '#000',
    colorInvert: '#fff',
    accent: '#FF6565',
    warning: '#f5d46c',
    warningLight: '#fffaea',
    accentLight: '#FCF7F4',
    surface: '#FFF',
    surfaceLight: '#FFF',
    border: 'rgba(0,0,0,.05)',
    borderDark: 'rgba(0,0,0,.08)',
    error: '#ca4a4a',
    borderSolid: '#ccc'
  },
  Dark: {
    background: '#000',
    neutral: '#141414',
    neutralLight: '#1f1f1f',
    color: '#fff',
    colorInvert: '#000',
    warning: '#ddbe60',
    warningLight: '#1c1b18',
    accent: '#f78a76',
    accentLight: '#181818',
    surface: '#2a2a2a',
    surfaceLight: '#1f1f1f',
    border: 'rgba(255,255,255,.02)',
    borderDark: 'rgba(255,255,255,.06)',
    error: '#c44747',
    borderSolid: '#434343'
  }
}
export const GlobalStyles = createGlobalStyle`
  :root {
    --screen-desktop: 994px;
    --screen-tablet: 738px;
    --screen-phone: 395px;
    --font-size-title: 28px;
    --font-size-title_sm: 20px;
    --font-size-text: 16px;
    --font-size-price: 18px;
    --font-size-price_xl: 24px;
    --button-height: 40px;
    --button-radius: 25px;
    --radius: 16px;
    --radius-xl: 32px;
    --shadow: 0px 4px 20px rgba(0, 0, 0, 0.01);
    --shadow-dark: 0px 4px 25px rgba(0, 0, 0, 0.04);
    --color-background: ${themes.Light.background};
    --color-accent-light: ${themes.Light.accentLight};
    --color-accent: ${themes.Light.accent};
    --color-neutral: ${themes.Light.neutral};
    --color-neutral-light: ${themes.Light.neutralLight};
    --color-text: ${themes.Light.color};
    --color-text-invert: ${themes.Light.colorInvert};
    --color-surface: ${themes.Light.surface};
    --color-surface-light: ${themes.Light.surfaceLight};
    --color-border: ${themes.Light.border};
    --color-border-dark: ${themes.Light.borderDark};
    --color-warning: ${themes.Light.warning};
    --color-warning-light: ${themes.Light.warningLight};
    --color-error: ${themes.Light.error};
    --color-border-solid: ${themes.Light.borderSolid};
  }
  .dark-theme {
    --color-background: ${themes.Dark.background};
    --color-accent-light: ${themes.Dark.accentLight};
    --color-accent: ${themes.Dark.accent};
    --color-neutral: ${themes.Dark.neutral};
    --color-neutral-light: ${themes.Dark.neutralLight};
    --color-text: ${themes.Dark.color};
    --color-text-invert: ${themes.Dark.colorInvert};
    --color-surface: ${themes.Dark.surface};
    --color-surface-light: ${themes.Dark.surfaceLight};
    --color-border: ${themes.Dark.border};
    --color-border-dark: ${themes.Dark.borderDark};
    --color-warning: ${themes.Dark.warning};
    --color-warning-light: ${themes.Dark.warningLight};
    --color-error: ${themes.Dark.error};
    --color-border-solid: ${themes.Dark.borderSolid};
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
  @media screen and (max-width: 425px){
    :root {
      --shadow-dark: 0px 10px 120px rgba(0, 0, 0, 0.2);
    }
  }
`;
