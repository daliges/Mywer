import React from 'react';
import styled from 'styled-components';

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

  return (
    <Row>
      <input
        type="checkbox"
        checked={checked}
        onChange={onCheck}
        style={{ marginRight: 12, width: 20, height: 20 }}
      />
      <AlbumArt src={albumArt} alt="cover" />
      <Info>
        <Title>{title}</Title>
        <Artist>{artist}</Artist>
      </Info>
    </Row>
  );
}