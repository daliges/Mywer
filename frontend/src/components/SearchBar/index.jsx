import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { Input, Button, Wrapper } from './SearchBar.styles';

export default function SearchBar({ value, onChange, onSearch }) {
  return (
    <form
      onSubmit={e => { e.preventDefault(); onSearch(); }}
      style={{ width: '100%', maxWidth: '600px', display: 'flex' }}
    >
      <Wrapper>
        <Input
          placeholder="Paste Spotify playlist URL…"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <Button type="submit">
          <FiSearch size={20} />
        </Button>
      </Wrapper>
    </form>
  );
}