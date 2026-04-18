import React from 'react';
import styled from 'styled-components';
import { FiSmile } from 'react-icons/fi';

const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto 1.5rem auto;
`;

const Label = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Syne', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1db954;
  margin-bottom: 1rem;
`;

const Box = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 2rem 2.5rem;
  border-radius: 16px;
  color: #fff;
  text-align: center;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -60%;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 200px;
    background: radial-gradient(ellipse, rgba(29, 185, 84, 0.07) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Text = styled.div`
  color: #c8d0dc;
  font-size: 1rem;
  font-family: 'Manrope', sans-serif;
  line-height: 1.75;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  position: relative;
  z-index: 1;
`;

const ConeLine = styled.div`
  width: ${({ $width }) => $width}%;
  margin: 0 auto;
  text-align: center;
  white-space: pre-line;
`;

export default function Personality({ text }) {
  const lines = (text || '').split('\n').filter(Boolean);
  const minWidth = 40;
  const maxWidth = 100;
  const step = lines.length > 1 ? (maxWidth - minWidth) / (lines.length - 1) : 0;

  return (
    <Wrapper>
      <Label>
        <FiSmile size={14} />
        Your Music Personality
      </Label>
      <Box>
        <Text>
          {lines.map((line, idx) => (
            <ConeLine key={idx} $width={maxWidth - idx * step}>
              {line}
            </ConeLine>
          ))}
        </Text>
      </Box>
    </Wrapper>
  );
}
