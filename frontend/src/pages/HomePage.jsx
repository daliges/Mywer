import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { getPlaylist } from '../services/api';
import styled from 'styled-components';

const Container = styled.div`
  display: flex; flex-direction: column;
  height: 100vh; justify-content: center; align-items: center;
  padding: 0 1rem;
`;
const List = styled.ul`
  margin-top: 2rem; color: ${({ theme }) => theme.colors.subtext};
  list-style: disc; list-style-position: inside;
`;

export default function HomePage() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    console.log('Searching for URL:', url);
    if (!url) return; // guard empty input
    const resp = await getPlaylist(url);
    navigate('/results', { state: { playlist: resp.data } });
  };

  return (
    <Container>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <h1>Discover Free Music</h1>
      <SearchBar value={url} onChange={setUrl} onSearch={handleSearch} />
      <List>
        <li>Find free-match tracks</li>
        <li>AI-powered recommendations</li>
        <li>Download for free</li>
      </List>
      </div>
    </Container>
  );
}