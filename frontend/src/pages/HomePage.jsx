import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { getPlaylist } from '../services/api';
import { HeroSection, HeroContent, Title, Features, Footer } from './HomePage.styles';
import { FiMusic, FiCpu, FiDownload } from 'react-icons/fi';

// --- GitHubButton component ---
const GitHubButton = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="https://github.com/daliges/Musicdw"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'absolute',
        top: 24,
        right: 32,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="GitHub Repository"
    >
      <span
        style={{
          width: 26,
          height: 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Reserve space for the icon at all times, no position absolute
        }}
      >
        <svg
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth={2}
          stroke={hovered ? "#1DB954" : "currentColor"}
          fill="none"
          viewBox="0 0 24 24"
          style={{
            width: 26,
            height: 26,
            transition: 'transform 0.2s, stroke 0.2s',
            transform: hovered ? 'scale(1.12)' : 'scale(1)',
            display: 'block'
          }}
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      </span>
      <span
        style={{
          marginTop: 6,
          fontSize: 13,
          fontWeight: 700,
          color: "#1DB954",
          background: "#18181b",
          borderRadius: 8,
          padding: hovered ? "2px 10px" : 0,
          boxShadow: hovered ? "0 2px 8px 0 rgba(30,185,84,0.10)" : "none",
          transition: "padding 0.2s, color 0.2s, box-shadow 0.2s, opacity 0.2s",
          opacity: hovered ? 1 : 0,
          height: hovered ? "auto" : 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        GitHub
      </span>
    </a>
  );
};

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!url) return;
    const resp = await getPlaylist(url);
    navigate('/results', { state: { playlist: resp.data } });
  };

  return (
    <>
      <HeroSection className="bg-hero bg-cover bg-center" style={{ position: 'relative' }}>
        <GitHubButton />
        <HeroContent>
          <Title style={{ fontWeight: 700, fontSize: '3rem', marginBottom: '2.5rem', color: '#fff' }}>
            Discover Free Music
          </Title>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '520px', maxWidth: '100%' }}>
              <SearchBar value={url} onChange={setUrl} onSearch={handleSearch} />
            </div>
          </div>
          <Features>
            <li>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiMusic size={36} style={{ color: "#1DB954", marginBottom: 12 }} />
                <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 4 }}>Find free-match tracks</div>
                <div style={{ fontWeight: 400, fontSize: '1rem', color: '#b3b3b3', maxWidth: 220 }}>
                  Discover music that perfectly matches your playlist's vibe
                </div>
              </div>
            </li>
            <li>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiCpu size={36} style={{ color: "#1DB954", marginBottom: 12 }} />
                <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 4 }}>AI-powered recommendations</div>
                <div style={{ fontWeight: 400, fontSize: '1rem', color: '#b3b3b3', maxWidth: 220 }}>
                  Our algorithm analyzes your music taste for perfect suggestions
                </div>
              </div>
            </li>
            <li>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiDownload size={36} style={{ color: "#1DB954", marginBottom: 12 }} />
                <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 4 }}>Download for free</div>
                <div style={{ fontWeight: 400, fontSize: '1rem', color: '#b3b3b3', maxWidth: 220 }}>
                  Legally download high-quality tracks from your collection
                </div>
              </div>
            </li>
          </Features>
        </HeroContent>
      </HeroSection>
      <div>
        <input
          ref={inputRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ display: 'none' }} // Hide the input field
        />
      </div>
      <Footer>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '16px 0 8px 0',
          fontSize: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
            fontSize: 18
          }}>
            <span style={{ color: '#1DB954', display: 'flex', alignItems: 'center' }}>
              <FiMusic size={20} style={{ marginRight: 4 }} />
              <span style={{ fontWeight: 700 }}>Mywer</span>
            </span>
          </div>
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.98rem',
            marginBottom: 2
          }}>
            <a href="#">About</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
          <div style={{
            color: '#b3b3b3',
            fontSize: '0.92rem',
            marginTop: 2
          }}>
            © 2025 Mywer. All rights reserved.
          </div>
        </div>
      </Footer>
    </>
  );
}