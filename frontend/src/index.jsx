import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { theme, GlobalStyle } from './theme/theme';
import App from './App';

// --- Fairy Dust Melody Notes Cursor Effect ---
function injectFairyDustMelody() {
  if (window.__fairyDustMelodyInjected) return;
  window.__fairyDustMelodyInjected = true;

  const notes = [
    // SVG paths for melody notes (eighth, quarter, beamed, etc.)
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="#1db954" xmlns="http://www.w3.org/2000/svg"><path d="M9 17a3 3 0 1 0 6 0V5h4V3H7v2h6v12z"/></svg>`,
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="#1db954" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v14.17A3 3 0 1 0 14 20V7h4V5h-6z"/></svg>`,
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="#1db954" xmlns="http://www.w3.org/2000/svg"><path d="M17 3v12.17A3 3 0 1 0 19 18V5h2V3h-4z"/><circle cx="9" cy="19" r="3" fill="#1db954"/></svg>`,
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="#1db954" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10.17A3 3 0 1 0 14 16V5h4V3h-6z"/></svg>`
  ];

  function randomNoteSVG() {
    return notes[Math.floor(Math.random() * notes.length)];
  }

  function createNote(x, y) {
    const div = document.createElement('div');
    div.innerHTML = randomNoteSVG();
    const svg = div.firstChild;
    svg.style.position = 'fixed';
    svg.style.left = `${x - 8}px`;
    svg.style.top = `${y - 8}px`;
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = 9999;
    svg.style.transition = 'transform 0.8s cubic-bezier(.4,0,.2,1), opacity 0.8s';
    svg.style.opacity = '1';
    svg.style.transform = `scale(${0.8 + Math.random() * 0.6}) rotate(${Math.random() * 60 - 30}deg)`;
    document.body.appendChild(svg);

    // Animate: float up and fade out
    setTimeout(() => {
      svg.style.transform += ` translateY(-32px)`;
      svg.style.opacity = '0';
    }, 10);

    setTimeout(() => {
      if (svg.parentNode) svg.parentNode.removeChild(svg);
    }, 800);
  }

  window.addEventListener('pointermove', (e) => {
    if (e.isTrusted && !e.buttons) {
      // Only show on main window, not iframes
      if (window.top !== window.self) return;
      // Reduce density for performance
      if (Math.random() < 0.6) return;
      createNote(e.clientX, e.clientY);
    }
  });
}

injectFairyDustMelody();

// --- Fairy Dust Melody Notes Falling From Cursor (fall below screen, bigger notes, lower density) ---
function injectFairyDustMelodyCursorFall() {
  if (window.__fairyDustMelodyCursorFallInjected) return;
  window.__fairyDustMelodyCursorFallInjected = true;

  const notes = [
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="#1db954" xmlns="http://www.w3.org/2000/svg"><path d="M9 17a3 3 0 1 0 6 0V5h4V3H7v2h6v12z"/></svg>`,
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="#1db954" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v14.17A3 3 0 1 0 14 20V7h4V5h-6z"/></svg>`,
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="#1db954" xmlns="http://www.w3.org/2000/svg"><path d="M17 3v12.17A3 3 0 1 0 19 18V5h2V3h-4z"/><circle cx="9" cy="19" r="3" fill="#1db954"/></svg>`,
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="#1db954" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10.17A3 3 0 1 0 14 16V5h4V3h-6z"/></svg>`
  ];

  function randomNoteSVG() {
    return notes[Math.floor(Math.random() * notes.length)];
  }

  function createFallingNote(x, y) {
    const div = document.createElement('div');
    div.innerHTML = randomNoteSVG();
    const svg = div.firstChild;
    svg.style.position = 'fixed';
    svg.style.left = `${x - 13}px`;
    svg.style.top = `${y - 13}px`;
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = 9999;
    svg.style.opacity = '1';
    svg.style.transform = `scale(${1.0 + Math.random() * 0.5}) rotate(${Math.random() * 60 - 30}deg)`;

    // Calculate distance to below the bottom of the screen
    const startY = y - 13;
    const endY = window.innerHeight + 60 + Math.random() * 40; // 60-100px below screen
    const distance = Math.max(40, endY - startY);
    const duration = Math.max(1.2, Math.min(3.2, distance / 350 + 1.1));
    svg.style.transition = `top ${duration}s linear, opacity 0.8s`;

    document.body.appendChild(svg);

    setTimeout(() => {
      svg.style.top = `${endY}px`;
      svg.style.opacity = '0.7';
    }, 10);

    setTimeout(() => {
      if (svg.parentNode) svg.parentNode.removeChild(svg);
    }, duration * 1000 + 400);
  }

  let lastTime = 0;
  window.addEventListener('pointermove', (e) => {
    if (e.isTrusted && !e.buttons) {
      if (window.top !== window.self) return;
      // Lower density: only create a note on ~20% of pointermove events
      if (Math.random() > 0.2) return;
      const now = Date.now();
      if (now - lastTime > 18) {
        createFallingNote(e.clientX, e.clientY);
        lastTime = now;
      }
    }
  });
}

injectFairyDustMelodyCursorFall();

const root = createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);