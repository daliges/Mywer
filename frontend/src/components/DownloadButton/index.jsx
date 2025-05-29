import React from 'react';
import styled from 'styled-components';
import { downloadTracks } from '../../services/api';

const Btn = styled.button`
  position: fixed; bottom: 1rem; right: 1rem;
  background: ${({ theme }) => theme.colors.accent};
  border: none; padding: 0.75rem 1.5rem; border-radius: 24px;
  cursor: pointer; font-weight: bold;
`;
export default function DownloadButton({ selected }) {
  const handleDownload = () => {
    // Map selected tracks to backend's FoundTrack shape
    const payload = selected.map(t => {
      // If found_on_jamendo exists, extract audio URLs from it
      const jamendo = t.found_on_jamendo || {};
      return {
        name: t.song || t.name || 'Unknown Title',
        artists: t.artists || [],
        audio: jamendo.audio || jamendo.audio_url || null,
        audiodownload: jamendo.audiodownload || jamendo.audiodownload_url || null
      };
    });
    downloadTracks(payload).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = 'tracks.zip'; a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return <Btn onClick={handleDownload}>Download {selected.length}</Btn>;
}