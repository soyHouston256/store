import { createGlobalStyle } from 'styled-components';

const themes: any = {
  Light: {
    background: '#FCF7F4',
    neutral: '#FFF',
    neutralLight: '#ebebeb',
    color: '#000',
    accent: '#FF6565'
  },
  Dark: {
    background: '#000',
    neutral: '#141414',
    neutralLight: '#1f1f1f',
    color: '#fff',
    accent: '#FF6565'
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
    --color-accent: ${themes.Light.accent};
    --color-neutral: ${themes.Light.neutral};
    --color-neutral-light: ${themes.Light.neutralLight};
    --color-text: ${themes.Light.color};
  }
  .dark-theme {
    --color-background: ${themes.Dark.background};
    --color-accent: ${themes.Dark.accent};
    --color-neutral: ${themes.Dark.neutral};
    --color-neutral-light: ${themes.Dark.neutralLight};
    --color-text: ${themes.Dark.color};
  }
`;
