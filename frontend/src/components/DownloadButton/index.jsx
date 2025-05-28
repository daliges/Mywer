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
    downloadTracks({ tracks: selected }).then(res => {
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'tracks.zip'; a.click();
    });
  };

  return <Btn onClick={handleDownload}>Download {selected.length}</Btn>;
}