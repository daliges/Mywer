import React from 'react';
import styled from 'styled-components';
import { FiCheck, FiExternalLink, FiLink } from 'react-icons/fi';

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  background: ${({ $checked }) => $checked ? 'rgba(29, 185, 84, 0.06)' : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${({ $checked }) => $checked ? 'rgba(29, 185, 84, 0.22)' : 'rgba(255, 255, 255, 0.06)'};
  margin-bottom: 0.5rem;
  gap: 1rem;
  position: relative;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: ${({ $checked }) => $checked ? 'rgba(29, 185, 84, 0.08)' : 'rgba(255, 255, 255, 0.04)'};
    border-color: ${({ $checked }) => $checked ? 'rgba(29, 185, 84, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const AlbumArt = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Title = styled.div`
  font-weight: 600;
  color: #fff;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Manrope', sans-serif;
`;

const Artist = styled.div`
  font-size: 0.88rem;
  color: #8b95a9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
  font-family: 'Manrope', sans-serif;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-top: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-family: 'Manrope', sans-serif;
  background: ${({ $error }) => $error ? 'rgba(255, 82, 82, 0.1)' : 'rgba(29, 185, 84, 0.1)'};
  color: ${({ $error }) => $error ? '#ff6b6b' : '#1db954'};
  border: 1px solid ${({ $error }) => $error ? 'rgba(255, 82, 82, 0.18)' : 'rgba(29, 185, 84, 0.18)'};
  width: fit-content;
`;

export const Checkbox = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: ${({ $checked }) => $checked ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1.5px solid ${({ $checked }) => $checked ? '#1db954' : 'rgba(255, 255, 255, 0.15)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${({ $checked }) => $checked ? '#1db954' : 'rgba(255, 255, 255, 0.35)'};
  }
`;

const Links = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  margin-left: 8px;
  margin-right: 2px;
  flex-shrink: 0;
`;

const PreviewButton = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1db954;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: rgba(29, 185, 84, 0.12);
    border-color: rgba(29, 185, 84, 0.25);
  }
`;

function getTrackReason(track) {
  if (track.found_on_jamendo) {
    return { msg: 'Free to download', error: false };
  }
  return { msg: 'Not copyright free', error: true };
}

export default function TrackItem({ track, checked, onCheck, downloadStatus, showSpotifyLink }) {
  const title = track.song || track.name || 'Unknown Title';
  const artist = Array.isArray(track.artists)
    ? track.artists.join(', ')
    : (track.artist || 'Unknown Artist');
  const albumArt =
    track.albumArt ||
    (track.found_on_jamendo && track.found_on_jamendo.album_image) ||
    null;

  const { msg: downloadMsg, error: isError } = getTrackReason(track);

  const spotifyUrl = track.spotify_url || track.external_url || null;
  const jamendoUrl =
    track.jamendo_url ||
    (track.found_on_jamendo && track.found_on_jamendo.id
      ? `https://www.jamendo.com/track/${track.found_on_jamendo.id}`
      : null);

  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef(null);
  const previewUrl = track.preview_url;

  function handlePreviewClick(e) {
    e.stopPropagation();
    if (playing) {
      setPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      setPlaying(true);
      if (audioRef.current) audioRef.current.play();
    }
  }

  function handleAudioEnded() {
    setPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
  }

  return (
    <Row $checked={checked} onClick={onCheck}>
      <Checkbox $checked={checked} tabIndex={0} role="checkbox" aria-checked={checked}
        onClick={e => { e.stopPropagation(); onCheck(); }}>
        {checked && <FiCheck color="#1db954" size={14} />}
      </Checkbox>
      <AlbumArt>
        {albumArt ? (
          <img src={albumArt} alt="cover" style={{ width: 40, height: 40, borderRadius: 7, objectFit: 'cover' }} />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            <path d="M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            <path d="M9 17v-13h10v13" />
            <path d="M9 8h10" />
          </svg>
        )}
      </AlbumArt>
      <Info>
        <Title>{title}</Title>
        <Artist>{artist}</Artist>
        <StatusBadge $error={isError}>{downloadMsg}</StatusBadge>
      </Info>
      <Links onClick={e => e.stopPropagation()}>
        {previewUrl && (
          <>
            <PreviewButton onClick={handlePreviewClick} title={playing ? 'Pause preview' : 'Play preview'}>
              {playing ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21 5,3" />
                </svg>
              )}
            </PreviewButton>
            <audio
              ref={audioRef}
              src={previewUrl}
              onEnded={handleAudioEnded}
              onPause={() => setPlaying(false)}
              style={{ display: 'none' }}
            />
          </>
        )}
        {jamendoUrl && (
          <a
            href={jamendoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#ff8800', display: 'flex', alignItems: 'center', opacity: 0.85, transition: 'opacity 0.15s' }}
            title="Open in Jamendo"
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
          >
            <FiLink size={20} />
          </a>
        )}
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1db954', display: 'flex', alignItems: 'center', opacity: 0.85, transition: 'opacity 0.15s' }}
            title="Open in Spotify"
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
          >
            <FiExternalLink size={20} />
          </a>
        )}
      </Links>
    </Row>
  );
}
