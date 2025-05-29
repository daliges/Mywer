import React from 'react';
import styled from 'styled-components';
import { FiCpu } from 'react-icons/fi';

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

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    margin-bottom: 0.7rem;
    font-size: 1.08rem;
    color: #b3b3b3;
  }
`;

export default function Recommendations({ list }) {
  return (
    <Box>
      <Title><FiCpu color="#1db954" /> AI Suggestions</Title>
      <List>
        {list?.map((s, i) => <li key={i}>{s}</li>)}
      </List>
    </Box>
  );
}