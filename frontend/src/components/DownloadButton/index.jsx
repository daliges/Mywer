import React, { useState } from 'react';
import styled from 'styled-components';
import { downloadTracks } from '../../services/api';
import { FiX, FiDownload } from 'react-icons/fi';

const Btn = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1DB954;
  color: #fff;
  border: none;
  padding: 0.85rem 1.6rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  font-family: 'Manrope', sans-serif;
  font-size: 0.97rem;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 4px 24px rgba(29, 185, 84, 0.4);
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;

  &:hover {
    background: #1aa349;
    transform: translateY(-2px);
    box-shadow: 0 6px 36px rgba(29, 185, 84, 0.55);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 12px rgba(29, 185, 84, 0.2);
  }
`;

const Count = styled.span`
  background: rgba(0, 0, 0, 0.18);
  border-radius: 999px;
  padding: 0.1rem 0.55rem;
  font-size: 0.88rem;
  font-weight: 700;
  min-width: 22px;
  text-align: center;
`;

export const LoaderOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
`;

const StyledLoader = styled.div`
  .container {
    width: 110px;
    height: 110px;
    background-color: #0f1420;
    border-radius: 14px;
    position: relative;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .plate {
    width: fit-content;
  }
  .plate .black,
  .plate .white,
  .plate .center,
  .plate .border {
    border-radius: 100%;
  }
  .container,
  .plate .black,
  .plate .white,
  .plate .border {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .plate .black {
    width: 82px;
    height: 82px;
    background-color: #1DB954;
    animation: rotation 1.5s infinite linear;
  }
  @keyframes rotation {
    from { transform: rotate(0deg); }
    to   { transform: rotate(359deg); }
  }
  .plate .white {
    width: 34px;
    height: 34px;
    background-color: #0f1420;
  }
  .plate .center {
    width: 11px;
    height: 11px;
    background-color: #1DB954;
  }
  .plate .border {
    width: 54px;
    height: 54px;
    border-top: 2px solid rgba(255,255,255,0.3);
    border-bottom: 2px solid rgba(255,255,255,0.3);
    border-left: 2px solid #1DB954;
    border-right: 2px solid #1DB954;
  }
  .player {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: fit-content;
    position: absolute;
    bottom: 0;
    right: 0;
    margin-bottom: 4px;
    margin-right: 4px;
    rotate: -45deg;
  }
  .player .circ {
    width: 14px;
    height: 14px;
    background-color: rgba(255,255,255,0.7);
    border-radius: 100%;
    z-index: 1;
  }
  .player .rect {
    width: 5px;
    height: 28px;
    background-color: rgba(255,255,255,0.7);
    position: absolute;
    bottom: 0;
    margin-bottom: 2px;
  }
`;

export function Loader() {
  return (
    <StyledLoader>
      <div className="container">
        <div className="plate">
          <div className="black">
            <div className="border">
              <div className="white">
                <div className="center" />
              </div>
            </div>
          </div>
        </div>
        <div className="player">
          <div className="rect" />
          <div className="circ" />
        </div>
      </div>
      <div style={{
        color: '#8b95a9',
        fontSize: '0.92rem',
        marginTop: 14,
        textAlign: 'center',
        fontWeight: 500,
        fontFamily: "'Manrope', sans-serif",
        letterSpacing: 0.1
      }}>
        Please wait, it will take a moment...
      </div>
    </StyledLoader>
  );
}

const ErrorBox = styled.div`
  position: fixed;
  bottom: 5rem;
  right: 2rem;
  background: #0f1420;
  color: #fff;
  border: 1px solid rgba(255, 82, 82, 0.35);
  border-radius: 14px;
  padding: 1rem 1.5rem;
  z-index: 200;
  max-width: 340px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  font-size: 0.95rem;
  min-width: 240px;
  font-family: 'Manrope', sans-serif;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 82, 82, 0.7);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.15s;

  &:hover {
    color: #ff5252;
  }
`;

export default function DownloadButton({ selected, loading, onDownload, setDownloadStatus }) {
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setError(null);
    try {
      const result = await onDownload(setError);
      if (setDownloadStatus && result && result.statusMap) {
        setDownloadStatus(result.statusMap);
      }
      if (result && result.errors && result.errors.length > 0) {
        setError(result.errors);
      }
    } catch (e) {
      setError([{ track: 'Unknown', reason: 'An unexpected error occurred.' }]);
    }
  };

  function conciseReason(reason) {
    if (/not found/i.test(reason) || /copyright/i.test(reason)) return 'Not found or not copyright free';
    if (/download url/i.test(reason)) return 'No download URL available';
    if (/download failed/i.test(reason)) return 'Download failed';
    if (!reason) return 'Cannot be downloaded';
    return reason;
  }

  let errorList = [];
  if (error) {
    const trackMap = new Map();
    if (Array.isArray(error)) {
      error.forEach(e => {
        let track = typeof e === 'object' && e.track ? e.track : (typeof e === 'string' ? e : 'Unknown');
        let reason = typeof e === 'object' && e.reason ? e.reason : '';
        if (!trackMap.has(track)) trackMap.set(track, conciseReason(reason));
      });
    } else if (typeof error === 'object' && error.track) {
      trackMap.set(error.track, conciseReason(error.reason));
    } else if (typeof error === 'string') {
      trackMap.set(error, 'Cannot be downloaded');
    }
    errorList = Array.from(trackMap.entries()).map(([track, reason]) => ({ track, reason }));
  }

  return (
    <>
      <Btn onClick={handleDownload} disabled={loading}>
        <FiDownload size={16} />
        Download
        <Count>{selected.length}</Count>
      </Btn>
      {error && (
        <ErrorBox>
          <CloseBtn onClick={() => setError(null)} title="Close">
            <FiX />
          </CloseBtn>
          <div style={{ fontWeight: 700, color: '#ff6b6b', marginBottom: 8, paddingRight: 20 }}>
            Some tracks could not be downloaded
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, paddingRight: 16, color: '#8b95a9' }}>
            {errorList.map((t, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{t.track}</span>
                {t.reason ? <span>: {t.reason}</span> : null}
              </li>
            ))}
          </ul>
        </ErrorBox>
      )}
    </>
  );
}
