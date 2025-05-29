import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import TrackList from '../components/TrackList';
import Recommendations from '../components/Recommendations';
import Personality from '../components/Personality';
import DownloadButton, { Loader } from '../components/DownloadButton';
import { findTracks, getRecommendations, downloadTracks } from '../services/api';
import styled from 'styled-components';

const Tabs = styled.div`
  display: flex;
  gap: 2rem;
  padding: 1.5rem 0 1.5rem 0;
  justify-content: center;
`;
const Tab = styled.button`
  background: none;
  border: none;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.subtext};
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1.5rem;
  border-radius: 999px;
  transition: background 0.2s;
  background: ${({ active }) => active ? '#18181b' : 'transparent'};
`;
const Content = styled.div`
   padding: 2rem;
   flex: 1;
   overflow-y: auto;
   background: ${({ theme }) => theme.colors.background};
 `;
const TopBar = styled.div`
  background: #18181b;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  box-shadow: none;
`;
const BackBtn = styled.button`
  background: none;
  border: none;
  color: #1db954;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  gap: 0.5rem;
`;

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const playlist = state.playlist;

  const [tracks, setTracks]     = useState([]);
  const [recs, setRecs]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [selected, setSelected] = useState([]);
  const [tab, setTab]           = useState('free');
  const [loading, setLoading]   = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    setInitialLoading(true);
    Promise.all([
      findTracks(playlist).then(r => setTracks(r.data)),
      getRecommendations(playlist).then(r => {
        setRecs(r.data.suggestions);
        setProfile(r.data.character);
      })
    ]).finally(() => setInitialLoading(false));
  }, [playlist]);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const payload = selected.map(idx => {
        const t = tracks[idx];
        const jamendo = t.found_on_jamendo || {};
        return {
          name: t.song || t.name || 'Unknown Title',
          artists: t.artists || [],
          audio: jamendo.audio || jamendo.audio_url || null,
          audiodownload: jamendo.audiodownload || jamendo.audiodownload_url || null
        };
      });
      const res = await downloadTracks(payload);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'tracks.zip'; a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar>
        <BackBtn onClick={() => navigate('/')}>
          <FiChevronLeft size={22} /> Back to homepage
        </BackBtn>
      </TopBar>
      <Tabs>
        <Tab active={tab==='free'} onClick={()=>setTab('free')}>Free Matches</Tab>
        <Tab active={tab==='recs'} onClick={()=>setTab('recs')}>AI Recs</Tab>
        <Tab active={tab==='profile'} onClick={()=>setTab('profile')}>Personality</Tab>
      </Tabs>
      <Content style={{ position: 'relative' }}>
        {tab === 'free' && (
          <>
            <TrackList
              tracks={tracks}
              selected={selected}
              setSelected={setSelected}
              loading={loading || initialLoading}
              Loader={loading ? Loader : undefined} // Only pass Loader for download, not for initial
            />
            {initialLoading && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.45)',
                zIndex: 30
              }}>
                <Loader />
              </div>
            )}
          </>
        )}
        {tab === 'recs' && <Recommendations list={recs} />}
        {tab === 'profile' && <Personality text={profile} />}
      </Content>
      {/* Only show DownloadButton if not loading and tracks are loaded */}
      {selected.length > 0 && !initialLoading && (
        <DownloadButton
          selected={selected.map(idx => tracks[idx])}
          loading={loading}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}