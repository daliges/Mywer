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
   position: relative;
   transition: opacity 0.35s cubic-bezier(.4,0,.2,1);
   opacity: ${({ $fade }) => ($fade ? 1 : 0)};
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
  const [fade, setFade] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState({}); // { [trackIdx]: { status, message } }

  useEffect(() => {
    setInitialLoading(true);
    Promise.all([
      findTracks(playlist).then(r => setTracks(r.data)),
      getRecommendations(playlist).then(r => {
        console.log("AI recommend response:", r.data); // <-- Add this line
        setRecs(r.data.suggestions);
        setProfile(r.data.character);
      })
    ]).finally(() => setInitialLoading(false));
  }, [playlist]);

  // Animate fade-out/fade-in on tab change
  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 30); // short delay for fade-out then fade-in
    return () => clearTimeout(timeout);
  }, [tab]);

  const handleDownload = async (setError) => {
    setLoading(true);
    setError && setError(null);
    let statusMap = {};
    let errors = [];
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
      const contentType = res.headers['content-type'];
      if (contentType && contentType.startsWith('application/zip')) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url; a.download = 'tracks.zip'; a.click();
        window.URL.revokeObjectURL(url);

        // --- Robustly parse not-found header ---
        let notFoundHeader = res.headers['x-not-found'];
        if (notFoundHeader) {
          try {
            if (
              (notFoundHeader.startsWith('"') && notFoundHeader.endsWith('"')) ||
              (notFoundHeader.startsWith("'") && notFoundHeader.endsWith("'"))
            ) {
              notFoundHeader = notFoundHeader.slice(1, -1);
            }
            // Unescape any \" to "
            notFoundHeader = notFoundHeader.replace(/\\"/g, '"');
            const notFound = JSON.parse(notFoundHeader);
            if (Array.isArray(notFound) && notFound.length > 0) {
              errors = notFound;
            }
          } catch (e) {}
        }
        // Mark all selected as success except those in errors
        selected.forEach((idx, i) => {
          const t = tracks[idx];
          const name = t.song || t.name || 'Unknown Title';
          const artists = t.artists || [];
          const trackLabel = `${name} - ${artists.join(', ')}`;
          const errorObj = errors.find(e => e.track === trackLabel);
          if (errorObj) {
            statusMap[idx] = { status: 'failed', message: errorObj.reason || 'Download failed' };
          } else {
            statusMap[idx] = { status: 'success', message: 'Downloaded successfully' };
          }
        });
      } else if (contentType && contentType.includes('application/json')) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result);
            if (json.not_found && Array.isArray(json.not_found) && json.not_found.length > 0) {
              setError && setError(json.not_found);
            } else if (json.detail) {
              setError && setError([{ track: json.detail, reason: "" }]);
            } else {
              setError && setError([{ track: "Unknown", reason: "Unknown error" }]);
            }
          } catch {
            setError && setError([{ track: "Unknown", reason: "Unknown error" }]);
          }
        };
        reader.readAsText(res.data);
        // Mark all selected as failed
        selected.forEach((idx) => {
          statusMap[idx] = { status: 'failed', message: 'Download failed' };
        });
      }
    } catch (err) {
      // Mark all selected as failed
      selected.forEach((idx) => {
        statusMap[idx] = { status: 'failed', message: 'Download failed' };
      });
      errors = [{ track: "Unknown", reason: "Download failed" }];
    } finally {
      setLoading(false);
    }
    return { errors, statusMap };
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
      <Content $fade={fade}>
        {tab === 'free' && (
          <>
            <TrackList
              tracks={tracks}
              selected={selected}
              setSelected={setSelected}
              loading={loading || initialLoading}
              Loader={loading ? Loader : undefined}
              downloadStatus={downloadStatus}
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
          setDownloadStatus={setDownloadStatus}
        />
      )}
    </div>
  );
}