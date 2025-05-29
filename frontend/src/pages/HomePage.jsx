import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { getPlaylist } from '../services/api';
import { HeroSection, HeroContent, Title, Features, Footer } from './HomePage.styles';
import { FiMusic, FiCpu, FiDownload } from 'react-icons/fi';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!url) return;
    const resp = await getPlaylist(url);
    navigate('/results', { state: { playlist: resp.data } });
  };

  return (
    <>
      <HeroSection className="bg-hero bg-cover bg-center">
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
                  Legally download high-quality tracks for your collection
                </div>
              </div>
            </li>
          </Features>
        </HeroContent>
      </HeroSection>
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
              <span style={{ fontWeight: 700 }}>Musicdw</span>
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
            © 2025 Musicdw. All rights reserved.
          </div>
        </div>
      </Footer>
    </>
  );
}