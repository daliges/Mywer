import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    header: '#1E1E1E',  // dark gray for header bar
    background: '#000000',   // app background
    surface:    '#FFFFFF',   // cards & search bar
    primary:    '#1DB954',   // search button
    accent:     '#1ED760',
    text:       '#009000',   // main text on white
    subtext:    '#808082'    // placeholder & secondary text
  },
    fonts: {
      body: "Roboto, sans-serif",
      heading: "Helvetica Neue, sans-serif"
    }
  };

  export const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

