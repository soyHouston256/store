import { createGlobalStyle } from 'styled-components';

const themes: any = {
  Light: {
    background: '#FCF7F4',
    neutral: '#FFF',
    neutralLight: '#f4f4f4',
    color: '#000',
    colorInvert: '#fff',
    accent: '#FF6565',
    accentLight: '#FCF7F4',
    surface: '#FFF'
  },
  Dark: {
    background: '#000',
    neutral: '#141414',
    neutralLight: '#1f1f1f',
    color: '#fff',
    colorInvert: '#000',
    accent: '#e27a7a',
    accentLight: '#181818',
    surface: '#1f1f1f'
  }
}
export const GlobalStyles = createGlobalStyle`
  :root {
    --screen-desktop: 1024px;
    --font-size-title: 28px;
    --font-size-text: 16px;
    --font-size-price: 18px;
    --button-height: 40px;
    --button-radius: 25px;
    --radius: 16px;
    --radius-xl: 32px;
    --shadow: 0px 4px 20px rgba(0, 0, 0, 0.01);
    --color-background: ${themes.Light.background};
    --color-accent-light: ${themes.Light.accentLight};
    --color-accent: ${themes.Light.accent};
    --color-neutral: ${themes.Light.neutral};
    --color-neutral-light: ${themes.Light.neutralLight};
    --color-text: ${themes.Light.color};
    --color-text-invert: ${themes.Light.colorInvert};
    --color-surface: ${themes.Light.surface};
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
  }
`;
