import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    header:     '#080c14',
    background: '#080c14',
    surface:    '#FFFFFF',
    primary:    '#1DB954',
    accent:     '#1ED760',
    text:       '#FFFFFF',
    subtext:    '#8b95a9'
  },
  fonts: {
    body:    "'Manrope', sans-serif",
    heading: "'Syne', sans-serif"
  }
};

export const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
    margin: 0;
    background: ${({ theme }) => theme.colors.background};
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.text};
  }
`;
