import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCopy, FiCheckCircle } from 'react-icons/fi';
import TrackList from '../components/TrackList';
import Personality from '../components/Personality';
import DownloadButton, { Loader } from '../components/DownloadButton';
import { findTracks, getRecommendations, downloadTracks } from '../services/api';
import styled from 'styled-components';
import axios from 'axios';

const Tabs = styled.div`
  display: flex;
  gap: 0;
  padding: 0 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: #080c14;
`;

const Tab = styled.button`
  background: none;
  border: none;
  border-bottom: 2px solid ${({ active }) => active ? '#1DB954' : 'transparent'};
  color: ${({ active }) => active ? '#fff' : '#8b95a9'};
  font-size: 0.95rem;
  font-weight: ${({ active }) => active ? '600' : '400'};
  font-family: 'Manrope', sans-serif;
  cursor: pointer;
  padding: 1.1rem 1.25rem;
  margin-bottom: -1px;
  transition: color 0.18s, border-color 0.18s;
  letter-spacing: 0.01em;

  &:hover {
    color: #fff;
  }
`;

const Content = styled.div`
  padding: 2.5rem 2rem;
  flex: 1;
  overflow-y: auto;
  background: #080c14;
  position: relative;
  transition: opacity 0.3s ease;
  opacity: ${({ $fade }) => ($fade ? 1 : 0)};
`;

const TopBar = styled.div`
  background: #080c14;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: #8b95a9;
  font-size: 0.92rem;
  font-family: 'Manrope', sans-serif;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  gap: 0.3rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const AiSectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Syne', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1db954;
  margin-bottom: 1.2rem;
`;

const ShowMoreBtn = styled.button`
  background: #1DB954;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.75rem 2rem;
  font-weight: 700;
  font-family: 'Manrope', sans-serif;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(29, 185, 84, 0.3);
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;

  &:hover {
    background: #1aa349;
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(29, 185, 84, 0.45);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingPill = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: #8b95a9;
  border-radius: 999px;
  padding: 0.75rem 2rem;
  font-size: 0.92rem;
  font-family: 'Manrope', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
`;

const CopyBtn = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 120;
  background: ${({ $success }) => $success ? '#1aa349' : '#1db954'};
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.6rem;
  font-weight: 700;
  font-family: 'Manrope', sans-serif;
  font-size: 0.97rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: ${({ $success }) => $success
    ? '0 0 0 5px rgba(29,185,84,0.2), 0 4px 24px rgba(29, 185, 84, 0.4)'
    : '0 4px 24px rgba(29, 185, 84, 0.35)'};
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 32px rgba(29, 185, 84, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

async function performDownload(trackList, selectedIdxs, setLoadingFn, setError) {
  setLoadingFn(true);
  setError && setError(null);
  let statusMap = {};
  let errors = [];
  try {
    const payload = selectedIdxs.map(idx => {
      const t = trackList[idx];
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

      let notFoundHeader = res.headers['x-not-found'];
      if (notFoundHeader) {
        try {
          if (
            (notFoundHeader.startsWith('"') && notFoundHeader.endsWith('"')) ||
            (notFoundHeader.startsWith("'") && notFoundHeader.endsWith("'"))
          ) {
            notFoundHeader = notFoundHeader.slice(1, -1);
          }
          notFoundHeader = notFoundHeader.replace(/\\"/g, '"');
          const notFound = JSON.parse(notFoundHeader);
          if (Array.isArray(notFound) && notFound.length > 0) errors = notFound;
        } catch (e) {}
      }
      selectedIdxs.forEach((idx) => {
        const t = trackList[idx];
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
            setError && setError([{ track: json.detail, reason: '' }]);
          } else {
            setError && setError([{ track: 'Unknown', reason: 'Unknown error' }]);
          }
        } catch {
          setError && setError([{ track: 'Unknown', reason: 'Unknown error' }]);
        }
      };
      reader.readAsText(res.data);
      selectedIdxs.forEach((idx) => {
        statusMap[idx] = { status: 'failed', message: 'Download failed' };
      });
    }
  } catch (err) {
    selectedIdxs.forEach((idx) => {
      statusMap[idx] = { status: 'failed', message: 'Download failed' };
    });
    errors = [{ track: 'Unknown', reason: 'Download failed' }];
  } finally {
    setLoadingFn(false);
  }
  return { errors, statusMap };
}

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const playlist = state.playlist;

  const [tracks, setTracks]     = useState([]);
  const [profile, setProfile]   = useState(null);
  const [selected, setSelected] = useState([]);
  const [tab, setTab]           = useState('free');
  const [loading, setLoading]   = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fade, setFade] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState({});

  const [aiTracks, setAiTracks] = useState([]);
  const [aiSelected, setAiSelected] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDownloadStatus, setAiDownloadStatus] = useState({});

  const [aiTotalRequested, setAiTotalRequested] = useState(5);
  const [aiAllRecs, setAiAllRecs] = useState([]);
  const [aiSpotifyData, setAiSpotifyData] = useState([]);

  const [copyAnim, setCopyAnim] = useState(false);

  const aiMatchesFetchedLen = useRef(0);
  const aiSpotifyFetchedLen = useRef(0);

  useEffect(() => {
    setInitialLoading(true);
    setProfile(null);
    setAiAllRecs([]);
    setAiTotalRequested(5);
    aiMatchesFetchedLen.current = 0;
    aiSpotifyFetchedLen.current = 0;
    setAiTracks([]);
    setAiSpotifyData([]);
    Promise.all([
      findTracks(playlist).then(r => setTracks(r.data)),
      getRecommendations({ ...playlist, count: 5 }).then(r => {
        setProfile(r.data.character);
        setAiAllRecs(r.data.suggestions || []);
      })
    ]).finally(() => setInitialLoading(false));
    // eslint-disable-next-line
  }, [playlist]);

  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 30);
    return () => clearTimeout(timeout);
  }, [tab]);

  const handleDownload = (setError) =>
    performDownload(tracks, selected, setLoading, setError);

  async function searchSpotifyTrack(name, artist) {
    try {
      const resp = await axios.get('http://localhost:8000/get-spotify-track/', {
        params: { name, artist }
      });
      return resp.data;
    } catch {
      return { spotify_url: null, preview_url: null };
    }
  }

  useEffect(() => {
    async function fetchAiMatches() {
      if (!aiAllRecs || !Array.isArray(aiAllRecs)) return;
      const newRecs = aiAllRecs.slice(aiMatchesFetchedLen.current);
      if (newRecs.length === 0) return;
      setAiLoading(true);
      const requests = newRecs.map(s => {
        const [name, ...rest] = s.split(' - ');
        const artist = rest.join(' - ').trim();
        return findTracks({
          id: 'https://fake.spotify.com/playlist/ai',
          tracks: {
            items: [{
              track: {
                name: name?.trim() || '',
                album: { name: '' },
                artists: [{ name: artist || '' }],
                albumArt: null,
                duration: null,
                isrc: null
              }
            }]
          }
        }).then(r => r.data[0]);
      });
      const results = await Promise.all(requests);
      setAiTracks(prev => [...prev, ...results]);
      aiMatchesFetchedLen.current = aiAllRecs.length;
      setAiLoading(false);
    }
    if (tab === 'profile' && aiAllRecs && aiAllRecs.length > 0) {
      fetchAiMatches();
    }
    // eslint-disable-next-line
  }, [tab, aiAllRecs]);

  useEffect(() => {
    setAiSelected([]);
  }, [aiTracks]);

  useEffect(() => {
    async function fetchSpotifyData() {
      if (!aiAllRecs || !Array.isArray(aiAllRecs)) return;
      const newRecs = aiAllRecs.slice(aiSpotifyFetchedLen.current);
      if (newRecs.length === 0) return;
      const requests = newRecs.map(s => {
        const [name, ...rest] = s.split(' - ');
        const artist = rest.join(' - ').trim();
        return searchSpotifyTrack(name?.trim() || '', artist || '');
      });
      const results = await Promise.all(requests);
      setAiSpotifyData(prev => [...prev, ...results]);
      aiSpotifyFetchedLen.current = aiAllRecs.length;
    }
    if (tab === 'profile' && aiAllRecs && aiAllRecs.length > 0) {
      fetchSpotifyData();
    }
    // eslint-disable-next-line
  }, [tab, aiAllRecs]);

  const handleShowMoreAiRecs = async () => {
    const nextCount = Math.min(aiTotalRequested + 10, 35);
    try {
      const r = await getRecommendations({ ...playlist, count: nextCount });
      const newRecs = r.data.suggestions || [];
      const prevSet = new Set(aiAllRecs);
      const uniqueNewRecs = newRecs.filter(x => !prevSet.has(x));
      setAiAllRecs(prev => [...prev, ...uniqueNewRecs]);
      setAiTotalRequested(nextCount);
    } catch {
      setAiLoading(false);
    }
  };

  function getJamendoUrlForAiTrack(aiTrack) {
    if (aiTrack.jamendo_url) return aiTrack.jamendo_url;
    if (aiTrack.found_on_jamendo && aiTrack.found_on_jamendo.id)
      return `https://www.jamendo.com/track/${aiTrack.found_on_jamendo.id}`;
    return null;
  }

  const handleCopyAiTracks = () => {
    const lines = aiSelected.map(idx => aiAllRecs[idx]).filter(Boolean);
    if (lines.length > 0) {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopyAnim(true);
      setTimeout(() => setCopyAnim(false), 1200);
    }
  };

  useEffect(() => {
    if (tab !== 'free' && selected.length > 0) setSelected([]);
  }, [tab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#080c14' }}>
      <TopBar>
        <BackBtn onClick={() => navigate('/')}>
          <FiChevronLeft size={18} /> Back
        </BackBtn>
      </TopBar>
      <Tabs>
        <Tab active={tab === 'free'} onClick={() => setTab('free')}>Free Matches</Tab>
        <Tab active={tab === 'profile'} onClick={() => setTab('profile')}>Personality</Tab>
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
                background: 'rgba(8,12,20,0.6)',
                zIndex: 30
              }}>
                <Loader />
              </div>
            )}
            {selected.length > 0 && !initialLoading && (
              <DownloadButton
                selected={selected.map(idx => tracks[idx])}
                loading={loading}
                onDownload={handleDownload}
                setDownloadStatus={setDownloadStatus}
              />
            )}
          </>
        )}
        {tab === 'profile' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <Personality text={profile} />
            </div>
            <AiSectionLabel>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="8" rx="4" />
                <path d="M12 8V4M8 4h8" />
                <circle cx="8.5" cy="12" r="1" />
                <circle cx="15.5" cy="12" r="1" />
              </svg>
              AI suggestions
            </AiSectionLabel>
            <TrackList
              tracks={aiTracks.map((t, i) => {
                const { spotify_url, preview_url } = aiSpotifyData[i] || {};
                return {
                  ...t,
                  albumArt:
                    (t.found_on_jamendo && t.found_on_jamendo.album_image)
                    || t.albumArt
                    || null,
                  spotify_url,
                  preview_url,
                  jamendo_url: getJamendoUrlForAiTrack(t),
                };
              })}
              selected={aiSelected}
              setSelected={setAiSelected}
              loading={initialLoading || aiLoading}
              downloadStatus={aiDownloadStatus}
              showSpotifyLink={true}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, minHeight: 48 }}>
              {!aiLoading && aiAllRecs.length < 35 ? (
                <ShowMoreBtn onClick={handleShowMoreAiRecs} disabled={aiLoading}>
                  Show More
                </ShowMoreBtn>
              ) : aiLoading ? (
                <LoadingPill>Loading more recommendations...</LoadingPill>
              ) : null}
            </div>
          </div>
        )}
      </Content>
      {tab === 'profile' && aiSelected.length > 0 && (
        <CopyBtn
          onClick={handleCopyAiTracks}
          disabled={aiSelected.length === 0}
          $success={copyAnim}
          title="Copy selected tracks to clipboard"
        >
          {copyAnim ? (
            <>
              <FiCheckCircle size={16} />
              Copied!
            </>
          ) : (
            <>
              <FiCopy size={16} /> Copy
            </>
          )}
        </CopyBtn>
      )}
    </div>
  );
}
