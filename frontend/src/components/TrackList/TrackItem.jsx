import React from 'react';
import styled from 'styled-components';
import { FiCheck, FiExternalLink, FiLink } from 'react-icons/fi';

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 10px;
  background: #18181b;
  margin-bottom: 0.75rem;
  gap: 1rem;
  position: relative;
`;

const AlbumArt = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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
  font-size: 1.08rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Artist = styled.div`
  font-size: 0.98rem;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CustomCheckbox = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #111;
  border: 2px solid #222;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border 0.15s;
  margin-right: 12px;
  ${props => props.checked && `
    border: 2px solid #1db954;
    background: #111;
  `}
`;

const DownloadMsg = styled.div`
  margin-top: 0.35rem;
  font-size: 0.97rem;
  color: ${({ error }) => error ? '#ff5252' : '#1db954'};
  font-weight: 500;
  word-break: break-word;
`;

const Links = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-left: 18px;
  margin-right: 4px;
  min-width: 0;
`;

const PreviewButton = styled.button`
  background: #222;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1db954;
  cursor: pointer;
  &:hover { background: #333; }
`;

// Always show one concise reason for each track, regardless of downloadStatus
function getTrackReason(track) {
  if (track.found_on_jamendo) {
      return { msg: "Free to download", error: false };
  }
  else {
    return { msg: "Not copyright free", error: true };
  }
}

export default function TrackItem({ track, checked, onCheck, downloadStatus, showSpotifyLink }) {
  // For /find-tracks/ results: use 'song' and 'artists'
  const title = track.song || track.name || 'Unknown Title';
  const artist = Array.isArray(track.artists)
    ? track.artists.join(', ')
    : (track.artist || 'Unknown Artist');
  // Prefer albumArt from Spotify, then Jamendo, then fallback
  const albumArt =
    track.albumArt ||
    (track.found_on_jamendo && track.found_on_jamendo.album_image) ||
    null;

  const { msg: downloadMsg, error: isError } = getTrackReason(track);

  // --- Add Spotify and Jamendo URLs ---
  const spotifyUrl = track.spotify_url || track.external_url || null;
  const jamendoUrl =
    track.jamendo_url ||
    (track.found_on_jamendo && track.found_on_jamendo.id
      ? `https://www.jamendo.com/track/${track.found_on_jamendo.id}`
      : null);

  // --- Audio preview logic ---
  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef(null);
  const previewUrl = track.preview_url || null;

  React.useEffect(() => {
    if (!playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [playing]);

  function handlePreviewClick(e) {
    e.stopPropagation();
    if (playing) {
      setPlaying(false);
    } else {
      setPlaying(true);
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
  }

  function handleAudioEnded() {
    setPlaying(false);
  }

  return (
    <Row>
      <CustomCheckbox checked={checked} onClick={onCheck} tabIndex={0} role="checkbox" aria-checked={checked}>
        {checked && <FiCheck color="#1db954" size={18} />}
      </CustomCheckbox>
      <AlbumArt>
        {albumArt ? (
          <img src={albumArt} alt="cover" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
        ) : (
          // Melody SVG icon
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <DownloadMsg error={isError}>{downloadMsg}</DownloadMsg>
      </Info>
      <Links>
        {previewUrl && (
          <>
            <PreviewButton onClick={handlePreviewClick} title={playing ? "Pause preview" : "Play preview"}>
              {playing ? (
                // Pause icon
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                // Play icon
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
            style={{ color: "#ff8800", display: 'flex', alignItems: 'center' }}
            title="Open in Jamendo"
          >
            <FiLink size={24} />
          </a>
        )}
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1db954", display: 'flex', alignItems: 'center' }}
            title="Open in Spotify"
          >
            <FiExternalLink size={24} />
          </a>
        )}
      </Links>
    </Row>
  );
}