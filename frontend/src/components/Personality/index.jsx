import React from 'react';
import styled from 'styled-components';

const Box = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1rem; border-radius: 8px;
`;
export default function Personality({ text }) {
  return (
    <Box>
      <h2>Your Music Personality</h2>
      <p>{text}</p>
    </Box>
  );
}