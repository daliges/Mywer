import React from 'react';
import styled from 'styled-components';
import { FiCpu, FiExternalLink, FiLink } from 'react-icons/fi';

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
  padding: 0.8rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  gap: 1rem;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const AlbumArt = styled.img`
  width: 46px;
  height: 46px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
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
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Manrope', sans-serif;
`;

const TrackArtist = styled.div`
  font-size: 0.88rem;
  color: #8b95a9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
  font-family: 'Manrope', sans-serif;
`;

const Title = styled.h2`
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

const Description = styled.div`
  max-width: 600px;
  width: 100%;
  margin: 0 auto 1.5rem auto;
  color: #8b95a9;
  font-size: 0.97rem;
  text-align: center;
  font-family: 'Manrope', sans-serif;
  line-height: 1.6;
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

function parseTrack(str) {
  const [name, ...rest] = str.split(' - ');
  return {
    name: name?.trim() || 'Unknown Title',
    artist: rest.join(' - ').trim() || '',
    albumArt: 'https://placehold.co/48x48/0f1420/444?text=♪'
  };
}

function norm(s) {
  return (s || '').trim().toLowerCase().replace(/[\s\-]+/g, ' ');
}

function getAlbumArtForRecommendation(parsed, playlistTracks = []) {
  const normName = norm(parsed.name);
  const normArtist = norm(parsed.artist);

  let match = playlistTracks.find(t => {
    const tName = norm(t.song || t.name);
    const tArtists = Array.isArray(t.artists) ? t.artists.join(', ') : (t.artists || '');
    return tName === normName && norm(tArtists) === normArtist;
  });

  if (!match) {
    match = playlistTracks.find(t => {
      const tName = norm(t.song || t.name);
      const tArtists = Array.isArray(t.artists) ? t.artists.join(', ') : (t.artists || '');
      return tName === normName && (norm(tArtists).includes(normArtist) || normArtist.includes(norm(tArtists)));
    });
  }

  if (!match) {
    match = playlistTracks.find(t => norm(t.song || t.name) === normName);
  }

  if (match) {
    return (
      match.albumArt ||
      (match.found_on_jamendo && match.found_on_jamendo.album_image) ||
      'https://placehold.co/48x48/0f1420/444?text=♪'
    );
  }
  return 'https://placehold.co/48x48/0f1420/444?text=♪';
}

export default function Recommendations({ list, personalityDescription, tracks = [] }) {
  const recs = (list || []).map((s) => {
    const parsed = parseTrack(s);
    const albumArt = getAlbumArtForRecommendation(parsed, tracks);
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
    return { label: s, ...parsed, albumArt, spotify_url, jamendo_url };
  });

  return (
    <Card>
      <div style={{ position: 'relative' }}>
        <Title><FiCpu size={14} /> AI Suggestions</Title>
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
                    style={{ color: '#ff8800', display: 'flex', alignItems: 'center', opacity: 0.85, transition: 'opacity 0.15s' }}
                    title="Open in Jamendo"
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
                  >
                    <FiLink size={20} />
                  </a>
                )}
                {t.spotify_url && (
                  <a
                    href={t.spotify_url}
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
          ))}
        </List>
      </div>
    </Card>
  );
}
