import React from 'react';
import styled from 'styled-components';
import TrackItem from './TrackItem';

const Card = styled.div`
  background: transparent;
  padding: 0;
  border-radius: 0;
  max-width: 800px;
  margin: 2rem auto 0 auto;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
  color: #fff;
  font-size: 1.08rem;
`;

export default function TrackList({ tracks, selected, setSelected }) {
  const allChecked = tracks.length > 0 && selected.length === tracks.length;
  const toggleAll = () => {
    if (allChecked) setSelected([]);
    else setSelected(tracks.map((_, i) => i));
  };
  const toggleOne = idx => {
    if (selected.includes(idx)) setSelected(selected.filter(i => i !== idx));
    else setSelected([...selected, idx]);
  };

  return (
    <Card>
      <SelectAllRow>
        <input
          type="checkbox"
          checked={allChecked}
          onChange={toggleAll}
          style={{ width: 20, height: 20, marginRight: 8 }}
        />
        Select all
      </SelectAllRow>
      <List>
        {tracks.map((track, idx) => (
          <TrackItem
            key={track.name || idx}
            track={track}
            checked={selected.includes(idx)}
            onCheck={() => toggleOne(idx)}
          />
        ))}
      </List>
    </Card>
  );
}