import React from 'react';
import styled from 'styled-components';
import { FiSmile } from 'react-icons/fi';

const Box = styled.div`
  background: #18181b;
  padding: 2rem;
  border-radius: 16px;
  max-width: 600px;
  margin: 2rem auto 0 auto;
  color: #fff;
  text-align: center;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
`;

const Text = styled.p`
  color: #b3b3b3;
  font-size: 1.08rem;
`;

export default function Personality({ text }) {
  return (
    <Box>
      <Title><FiSmile color="#1db954" /> Your Music Personality</Title>
      <Text>{text}</Text>
    </Box>
  );
}