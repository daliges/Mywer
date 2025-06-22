import React from 'react';
import styled from 'styled-components';
import { FiCpu, FiExternalLink, FiLink } from 'react-icons/fi';

// Use the same styled components as TrackList
const Card = styled.div`
  background: transparent;
  padding: 0;
  border-radius: 0;
  max-width: 800px;
  margin: 2rem auto 0 auto;
  position: relative;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 10px;
  background: #18181b;
  margin-bottom: 0.75rem;
  gap: 1rem;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
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

const TrackTitle = styled.div`
  font-weight: 600;
  color: #fff;
  font-size: 1.08rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtist = styled.div`
  font-size: 0.98rem;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
`;

const Description = styled.div`
  max-width: 600px;
  width: 100%;
  margin: 0 auto 1.5rem auto;
  color: #d1d1d1;
  font-size: 1.04rem;
  text-align: center;
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

function parseTrack(str) {
  const [name, ...rest] = str.split(' - ');
  return {
    name: name?.trim() || 'Unknown Title',
    artist: rest.join(' - ').trim() || '',
    albumArt: 'https://placehold.co/48x48/222/fff?text=♪'
  };
}

// Helper: normalize string for comparison
function norm(s) {
  return (s || '').trim().toLowerCase().replace(/[\s\-]+/g, ' ');
}

// Try to match suggestion to playlist track by name and artist (case-insensitive, fuzzy)
function getAlbumArtForRecommendation(parsed, playlistTracks = []) {
  const normName = norm(parsed.name);
  const normArtist = norm(parsed.artist);

  // Try to match both name and artist exactly
  let match = playlistTracks.find(t => {
    const tName = norm(t.song || t.name);
    const tArtists = Array.isArray(t.artists) ? t.artists.join(', ') : (t.artists || '');
    return tName === normName && norm(tArtists) === normArtist;
  });

  // Try to match name and artist as substring (for fuzzy artist matches)
  if (!match) {
    match = playlistTracks.find(t => {
      const tName = norm(t.song || t.name);
      const tArtists = Array.isArray(t.artists) ? t.artists.join(', ') : (t.artists || '');
      return tName === normName && (norm(tArtists).includes(normArtist) || normArtist.includes(norm(tArtists)));
    });
  }

  // Try to match just name
  if (!match) {
    match = playlistTracks.find(t => norm(t.song || t.name) === normName);
  }

  // Use albumArt from Spotify, then Jamendo, then fallback
  if (match) {
    return (
      match.albumArt ||
      (match.found_on_jamendo && match.found_on_jamendo.album_image) ||
      'https://placehold.co/48x48/222/fff?text=♪'
    );
  }
  return 'https://placehold.co/48x48/222/fff?text=♪';
}

export default function Recommendations({ list, personalityDescription, tracks = [] }) {
  // tracks: original playlist tracks (array of {song, name, artists, albumArt, found_on_jamendo, ...})
  const recs = (list || []).map((s, i) => {
    const parsed = parseTrack(s);
    const albumArt = getAlbumArtForRecommendation(parsed, tracks);
    // Try to find Spotify/Jamendo URLs from original tracks
    let spotify_url = null, jamendo_url = null;
    const match = tracks.find(t => {
      const tName = norm(t.song || t.name);
      const tArtists = Array.isArray(t.artists) ? t.artists.join(', ') : (t.artists || '');
      return tName === norm(parsed.name) && norm(tArtists) === norm(parsed.artist);
    });
    if (match) {
      spotify_url = match.spotify_url || match.external_url || null;
      jamendo_url =
        match.jamendo_url ||
        (match.found_on_jamendo && match.found_on_jamendo.id
          ? `https://www.jamendo.com/track/${match.found_on_jamendo.id}`
          : null);
    }
    return {
      label: s,
      ...parsed,
      albumArt,
      spotify_url,
      jamendo_url,
    };
  });

  return (
    <Card>
      <div style={{ position: 'relative' }}>
        <Title><FiCpu color="#1db954" /> AI Suggestions</Title>
        {personalityDescription && (
          <Description>{personalityDescription}</Description>
        )}
        <List>
          {recs.map((t, i) => (
            <Row key={i}>
              <AlbumArt src={t.albumArt} alt="cover" />
              <Info>
                <TrackTitle>{t.name}</TrackTitle>
                <TrackArtist>{t.artist}</TrackArtist>
              </Info>
              <Links>
                {t.jamendo_url && (
                  <a
                    href={t.jamendo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#ff8800", display: 'flex', alignItems: 'center' }}
                    title="Open in Jamendo"
                  >
                    <FiLink size={24} />
                  </a>
                )}
                {t.spotify_url && (
                  <a
                    href={t.spotify_url}
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
          ))}
        </List>
      </div>
    </Card>
  );
}