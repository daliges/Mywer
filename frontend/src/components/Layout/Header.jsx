import React from 'react';
import styled from 'styled-components';
import { FiChevronLeft } from 'react-icons/fi';

const Bar = styled.div`
  display: flex; align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.surface};
`;
const Title = styled.h1`
  flex: 1; font-size: 1.25rem;
`;

export default function Header({ onHome }) {
  return (
    <Bar>
      <FiChevronLeft size={24} onClick={onHome} style={{ cursor: 'pointer' }} />
      <Title>SpotJam</Title>
    </Bar>
  );
}