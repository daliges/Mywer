import React from 'react';
import { FiSearch, FiMusic } from 'react-icons/fi';
import { Input, Button, Wrapper, Icon } from './SearchBar.styles';

export default function SearchBar({ value, onChange, onSearch }) {
  return (
    <form
      onSubmit={e => { e.preventDefault(); onSearch(); }}
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
    >
      <Wrapper style={{ position: 'relative' }}>
        <Icon>
          <FiMusic />
        </Icon>
        <Input
          placeholder="Paste Spotify playlist URL..."
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
        <Button type="submit">
          <FiSearch />
        </Button>
      </Wrapper>
    </form>
  );
}