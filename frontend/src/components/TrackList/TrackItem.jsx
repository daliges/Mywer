import React from 'react';
import styled, { css } from 'styled-components';

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.surface};  /* white */
  cursor: pointer;
  ${({ selected, theme }) => selected && css`
    border: 2px solid ${theme.colors.primary};
  `}
`;

const Info = styled.div`
  margin-left: 1rem;
  overflow: hidden;
`;
const Title = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};  /* black */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Artist = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.subtext};  /* gray */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default function TrackItem({ track, selected, setSelected }) {
  const isSel = selected.includes(track.id);
  const toggle = () => {
    setSelected(prev =>
      isSel ? prev.filter(song => song !== track.song) : [...prev, track.song]
    );
  };

  return (
    <Row selected={isSel} onClick={toggle}>
      <input type="checkbox" checked={isSel} readOnly />
      <Info>
        <Title>{track.song}</Title>                {/* song title */}
        <Artist>{track.artists.join(', ')}</Artist> {/* artists list */}
        {/* Optional album display: */}
      </Info>
    </Row>
  );
}