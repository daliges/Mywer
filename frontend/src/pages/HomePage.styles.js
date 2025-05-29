import styled from 'styled-components';

export const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #1a2a1d 0%, #111 100%);
  position: relative;
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 700px;
  width: 100%;
  padding: 0 1rem;
  color: #fff;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.surface};
  font-weight: 700;
`;

export const Features = styled.ul`
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  gap: 4rem;
  list-style: none;
  padding: 0;
  li {
    color: #fff;
    font-size: 1.1rem;
    font-weight: 500;
    text-align: center;
    min-width: 180px;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 500px;
  background: #18181b;
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  align-items: center;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08);
`;

export const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.1rem;
  padding: 0.75rem 1rem;
  &::placeholder { color: #888; }
  &:focus { outline: none; }
`;

export const Button = styled.button`
  background: #1DB954;
  color: #fff;
  border: none;
  padding: 0.6rem 0.9rem;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover { background: #1AA34A; }
`;

export const Footer = styled.footer`
  width: 100%;
  background: #18181b;
  color: #fff;
  padding: 1.5rem 0 1rem 0;
  text-align: center;
  font-size: 1rem;
  margin-top: auto;
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    a {
      color: #fff;
      text-decoration: none;
    }
  }
  .footer-bottom {
    margin-top: 16px;
    color: #b3b3b3;
    font-size: 0.95rem;
  }
`;