import React, { useEffect } from 'react';
import styled from 'styled-components';
import TrackItem from './TrackItem';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1rem;
  border-radius: 8px;
  max-width: 800px;
  margin: 1rem auto;
`;
const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export default function TrackList({ tracks, selected, setSelected }) {
  useEffect(() => {
    console.log('Tracks data:', tracks);
  }, [tracks]);
  return (
    <Card>
      <List>
      {tracks.map((track, idx) => (
         <TrackItem
           key={track.audio?.href || track.song || idx}
           track={track}
           selected={selected}
           setSelected={setSelected}
         />
       ))}
      </List>
    </Card>
  );
}