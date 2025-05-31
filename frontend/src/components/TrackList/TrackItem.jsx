import React from 'react';
import styled from 'styled-components';
import { FiCheck } from 'react-icons/fi';

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 10px;
  background: #18181b;
  margin-bottom: 0.75rem;
  gap: 1rem;
`;

const AlbumArt = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #222;
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

// Always show one concise reason for each track, regardless of downloadStatus
function getTrackReason(track) {
  if (track.found_on_jamendo) {
      return { msg: "Free to download", error: false };
  }
  else {
    return { msg: "Not copyright free", error: true };
  }
}

export default function TrackItem({ track, checked, onCheck }) {
  // For /find-tracks/ results: use 'song' and 'artists'
  const title = track.song || track.name || 'Unknown Title';
  const artist = Array.isArray(track.artists)
    ? track.artists.join(', ')
    : (track.artist || 'Unknown Artist');
  // Prefer albumArt from Spotify, then Jamendo, then fallback
  const albumArt =
    track.albumArt ||
    (track.found_on_jamendo && track.found_on_jamendo.album_image) ||
    'https://placehold.co/48x48/222/fff?text=♪';

  const { msg: downloadMsg, error: isError } = getTrackReason(track);

  return (
    <Row>
      <CustomCheckbox checked={checked} onClick={onCheck} tabIndex={0} role="checkbox" aria-checked={checked}>
        {checked && <FiCheck color="#1db954" size={18} />}
      </CustomCheckbox>
      <AlbumArt src={albumArt} alt="cover" />
      <Info>
        <Title>{title}</Title>
        <Artist>{artist}</Artist>
        <DownloadMsg error={isError}>{downloadMsg}</DownloadMsg>
      </Info>
    </Row>
  );
}