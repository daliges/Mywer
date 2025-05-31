import React from 'react';
import styled from 'styled-components';
import TrackItem from './TrackItem';
import { FiCheck } from 'react-icons/fi';

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
  ${({ $loading }) => $loading && `
    pointer-events: none;
    filter: blur(1.5px) brightness(0.7);
    opacity: 0.7;
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
  background: rgba(0,0,0,0.45);
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
  color: #fff;
  font-size: 1.08rem;
`;

const GreyCheckbox = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #232323;
  border: 2px solid #444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 8px;
  ${props => props.checked && `
    border: 2px solid #888;
    background: #232323;
  `}
`;

export default function TrackList({ tracks, selected, setSelected, loading = false, Loader, downloadStatus = {} }) {
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
        <SelectAllRow>
          <GreyCheckbox checked={allChecked} onClick={toggleAll} tabIndex={0} role="checkbox" aria-checked={allChecked}>
            {allChecked && <FiCheck color="#b3b3b3" size={18} />}
          </GreyCheckbox>
          Select all
        </SelectAllRow>
        <List $loading={loading}>
          {tracks.map((track, idx) => (
            <TrackItem
              key={track.id || `${track.name}-${idx}` || idx}
              track={track}
              checked={selected.includes(idx)}
              onCheck={() => toggleOne(idx)}
              downloadStatus={downloadStatus[idx]}
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