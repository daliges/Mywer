import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  width: 540px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  align-items: center;
  padding: 0.25rem 0.35rem 0.25rem 0.25rem;
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
    font-size: 1rem;
  }

  &:focus,
  &:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }

  position: relative;
`;

export const Icon = styled.span`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #1DB954;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
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
  flex-shrink: 0;

  &:hover {
    background: #1aa349;
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.96);
  }
`;
