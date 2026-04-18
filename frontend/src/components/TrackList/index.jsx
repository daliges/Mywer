import React from 'react';
import styled from 'styled-components';
import TrackItem, { Checkbox } from './TrackItem';
import { FiCheck } from 'react-icons/fi';

const Card = styled.div`
  background: transparent;
  padding: 0;
  border-radius: 0;
  max-width: 800px;
  margin: 1.5rem auto 0 auto;
  position: relative;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  ${({ $loading }) => $loading && `
    pointer-events: none;
    filter: blur(1.5px) brightness(0.6);
    opacity: 0.6;
    transition: filter 0.2s, opacity 0.2s;
  `}
`;

const Overlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  background: rgba(8, 12, 20, 0.55);
  border-radius: 12px;
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  padding: 0.55rem 0.85rem;
  width: fit-content;

  &:hover span {
    color: #fff;
  }
`;

const SelectAllLabel = styled.span`
  color: #8b95a9;
  font-size: 0.88rem;
  font-weight: 500;
  font-family: 'Manrope', sans-serif;
  transition: color 0.15s;
  user-select: none;
`;


export default function TrackList({ tracks, selected, setSelected, loading = false, Loader, downloadStatus = {}, showSpotifyLink = false }) {
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
      <div style={{ position: 'relative' }}>
        <List $loading={loading}>
          <SelectAllRow onClick={toggleAll} tabIndex={0} role="checkbox" aria-checked={allChecked}>
            <Checkbox $checked={allChecked}>
              {allChecked && <FiCheck color="#1db954" size={13} />}
            </Checkbox>
            <SelectAllLabel>Select all</SelectAllLabel>
          </SelectAllRow>
          {tracks.map((track, idx) => (
            <TrackItem
              key={track.id || `${track.name}-${idx}` || idx}
              track={track}
              checked={selected.includes(idx)}
              onCheck={() => toggleOne(idx)}
              downloadStatus={downloadStatus[idx]}
              showSpotifyLink={showSpotifyLink}
            />
          ))}
        </List>

        {loading && Loader && (
          <Overlay>
            <Loader />
          </Overlay>
        )}
      </div>
    </Card>
  );
}
