import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import TrackList from '../components/TrackList';
import Recommendations from '../components/Recommendations';
import Personality from '../components/Personality';
import DownloadButton from '../components/DownloadButton';
import { findTracks, getRecommendations } from '../services/api';
import styled from 'styled-components';

const Tabs = styled.div`
  display: flex; gap: 1rem; padding: 1rem;
`;
const Tab = styled.button`
  background: none; border: none; color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.subtext};
  font-size: 1rem; cursor: pointer;
`;
const Content = styled.div`
   padding: 2rem;
   flex: 1;
   overflow-y: auto;
   background: ${({ theme }) => theme.colors.background};
 `;

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();        // define navigate before use
  const playlist = state.playlist;  // now defined before any hooks

  const [tracks, setTracks]     = useState([]);
  const [recs, setRecs]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [selected, setSelected] = useState([]);
  const [tab, setTab]           = useState('free');

  useEffect(() => {
    findTracks(playlist).then(r => setTracks(r.data));
    getRecommendations(playlist).then(r => {
      setRecs(r.data.suggestions);
      setProfile(r.data.character);
    });
  }, [playlist]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header onHome={() => navigate('/')} />
      <Tabs>
        <Tab active={tab==='free'} onClick={()=>setTab('free')}>Free Matches</Tab>
        <Tab active={tab==='recs'} onClick={()=>setTab('recs')}>AI Recs</Tab>
        <Tab active={tab==='profile'} onClick={()=>setTab('profile')}>Personality</Tab>
      </Tabs>
      <Content>
        {tab === 'free' && <TrackList tracks={tracks} selected={selected} setSelected={setSelected} />}
        {tab === 'recs' && <Recommendations list={recs} />}
        {tab === 'profile' && <Personality text={profile} />}
      </Content>
      {selected.length > 0 && <DownloadButton selected={selected} />}
    </div>
  );
}