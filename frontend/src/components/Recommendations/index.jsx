import React from 'react';
import styled from 'styled-components';

const Box = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1rem; border-radius: 8px;
`;
export default function Recommendations({ list }) {
  return (
    <Box>
      <h2>AI Suggestions</h2>
      <ul>
        {list?.map((s,i) => <li key={i}>{s}</li>)}
      </ul>
    </Box>
  );
}