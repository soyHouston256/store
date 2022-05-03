import { createGlobalStyle } from 'styled-components';

const themes: any = {
  Light: {
    background: '#fff',
    color: '#000',
  },
  Dark: {
    background: '#000',
    color: '#fff',
  }
}
export const GlobalStyles = createGlobalStyle`
  :root {
    --screen-desktop: 1024px;
    --color-background: ${themes.Light.background};
    --color-text: ${themes.Light.color};
  }
  .dark-theme {
    --color-background: ${themes.Dark.background};
    --color-text: ${themes.Dark.color};
  }
`;
