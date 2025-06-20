import React from 'react';
import styled from 'styled-components';
import { FiSmile } from 'react-icons/fi';

const Box = styled.div`
  background: #18181b;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 1.5rem auto;
  color: #fff;
  text-align: center;
  box-sizing: border-box;
  min-width: 0;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
`;

const Text = styled.div`
  color: #b3b3b3;
  font-size: 1.08rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
`;

const ConeLine = styled.div`
  width: ${({ width }) => width}%;
  margin: 0 auto;
  text-align: center;
  white-space: pre-line;
`;

export default function Personality({ text }) {
  // Split text into lines, and assign each line a decreasing width for cone effect
  const lines = (text || '').split('\n').filter(Boolean);
  const minWidth = 40; // percent
  const maxWidth = 100; // percent
  const step = lines.length > 1 ? (maxWidth - minWidth) / (lines.length - 1) : 0;

  return (
    <>
      <Title><FiSmile color="#1db954" /> Your Music Personality</Title>
      <Box>
        <Text>
          {lines.map((line, idx) => (
            <ConeLine
              key={idx}
              width={maxWidth - idx * step}
            >
              {line}
            </ConeLine>
          ))}
        </Text>
      </Box>
    </>
  );
}