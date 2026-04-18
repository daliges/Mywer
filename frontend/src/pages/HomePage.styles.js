import styled from 'styled-components';

export const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100vh;
  background: #080c14;
  position: relative;
  overflow: hidden;

  /* Green aurora glow at top */
  &::before {
    content: '';
    position: absolute;
    top: -10%;
    left: 50%;
    transform: translateX(-50%);
    width: 900px;
    height: 500px;
    background: radial-gradient(ellipse at center, rgba(29, 185, 84, 0.14) 0%, rgba(29, 185, 84, 0.04) 45%, transparent 70%);
    pointer-events: none;
    animation: auroraFloat 7s ease-in-out infinite alternate;
  }

  /* Subtle dot grid texture */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none;
  }

  @keyframes auroraFloat {
    0%   { opacity: 0.7; transform: translateX(-50%) scale(0.96); }
    100% { opacity: 1;   transform: translateX(-50%) scale(1.04); }
  }
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 700px;
  width: 100%;
  padding: 0 1.5rem;
  color: #fff;
`;

export const Title = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: 3.6rem;
  font-weight: 800;
  margin: 0 0 2.5rem 0;
  color: #fff;
  letter-spacing: -0.03em;
  line-height: 1.08;

  span {
    color: #1DB954;
  }

  @media (max-width: 600px) {
    font-size: 2.4rem;
  }
`;

export const Features = styled.ul`
  margin-top: 3.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  list-style: none;
  padding: 0;
  flex-wrap: wrap;

  li {
    color: #fff;
    font-size: 0.92rem;
    font-weight: 500;
    text-align: center;
    flex: 1;
    min-width: 160px;
    max-width: 200px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    padding: 1.5rem 1rem;
    transition: border-color 0.2s, background 0.2s;

    &:hover {
      border-color: rgba(29, 185, 84, 0.28);
      background: rgba(29, 185, 84, 0.04);
    }
  }
`;

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 540px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 0.25rem 0.35rem 0.25rem 0.25rem;
  align-items: center;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: rgba(29, 185, 84, 0.5);
    box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.08);
  }
`;

export const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1rem;
  font-family: 'Manrope', sans-serif;
  padding: 0.9rem 0.5rem 0.9rem 2.4rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.32);
  }

  &:focus {
    outline: none;
  }
`;

export const Button = styled.button`
  background: #1DB954;
  color: #fff;
  border: none;
  padding: 0.65rem 0.95rem;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: background 0.18s, transform 0.13s;

  &:hover {
    background: #1aa349;
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.96);
  }
`;

export const Footer = styled.footer`
  width: 100%;
  background: #080c14;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: #fff;
  padding: 1.5rem 0 1rem 0;
  text-align: center;
  font-family: 'Manrope', sans-serif;

  a {
    color: #8b95a9;
    text-decoration: none;
    transition: color 0.18s;

    &:hover {
      color: #1DB954;
    }
  }
`;
