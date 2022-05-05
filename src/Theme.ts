import { createGlobalStyle } from 'styled-components';

const themes: any = {
  Light: {
    background: '#FCF7F4',
    neutral: '#FFF',
    color: '#000',
  },
  Dark: {
    background: '#000',
    neutral: '#141414',
    color: '#fff',
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
    --shadow: 0px 4px 20px rgba(0, 0, 0, 0.01);
    --color-background: ${themes.Light.background};
    --color-neutral: ${themes.Light.neutral};
    --color-text: ${themes.Light.color};
  }
  .dark-theme {
    --color-background: ${themes.Dark.background};
    --color-neutral: ${themes.Dark.neutral};
    --color-text: ${themes.Dark.color};
  }
`;
