import React from 'react';
import styled, { useTheme } from 'styled-components';
import { downloadTracks } from '../../services/api';

const Btn = styled.button`
  position: fixed; bottom: 1rem; right: 1rem;
  background: ${({ theme }) => theme.colors.accent};
  border: none; padding: 0.75rem 1.5rem; border-radius: 24px;
  cursor: pointer; font-weight: bold;
  z-index: 100;
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
    width: 120px;
    height: 120px;
    background-color: ${({ theme }) => theme.colors.header || '#18181b'};
    border-radius: 12px;
    position: relative;
    box-shadow: 0 2px 16px 0 rgba(0,0,0,0.18);
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
    width: 90px;
    height: 90px;
    background-color: ${({ theme }) => theme.colors.primary || '#1DB954'};
    animation: rotation 1.5s infinite linear;
  }
  @keyframes rotation {
    from { transform: rotate(0deg);}
    to { transform: rotate(359deg);}
  }
  .plate .white {
    width: 38px;
    height: 38px;
    background-color: ${({ theme }) => theme.colors.surface || '#fff'};
  }
  .plate .center {
    width: 12px;
    height: 12px;
    background-color: ${({ theme }) => theme.colors.primary || '#1DB954'};
  }
  .plate .border {
    width: 60px;
    height: 60px;
    border-top: 2px solid ${({ theme }) => theme.colors.surface || '#fff'};
    border-bottom: 2px solid ${({ theme }) => theme.colors.surface || '#fff'};
    border-left: 2px solid ${({ theme }) => theme.colors.primary || '#1DB954'};
    border-right: 2px solid ${({ theme }) => theme.colors.primary || '#1DB954'};
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
    width: 16px;
    height: 16px;
    background-color: ${({ theme }) => theme.colors.surface || '#fff'};
    border-radius: 100%;
    z-index: 1;
  }
  .player .rect {
    width: 6px;
    height: 32px;
    background-color: ${({ theme }) => theme.colors.surface || '#fff'};
    position: absolute;
    bottom: 0;
    margin-bottom: 2px;
  }
`;

export function Loader() {
  const theme = useTheme();
  return (
    <StyledLoader theme={theme}>
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
        color: theme.colors.subtext || '#b3b3b3',
        fontSize: '1.08rem',
        marginTop: 12,
        textAlign: 'center',
        fontWeight: 500,
        letterSpacing: 0.2
      }}>
        Please wait, it will take a moment...
      </div>
    </StyledLoader>
  );
}

export default function DownloadButton({ selected, loading, onDownload }) {
  return (
    <Btn onClick={onDownload} disabled={loading}>
      Download {selected.length}
    </Btn>
  );
}