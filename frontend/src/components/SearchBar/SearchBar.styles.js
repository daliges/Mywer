import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  width: 540px; /* slightly longer */
  background: #18181b;
  border-radius: 999px;
  align-items: center;
  padding: 0.1rem 0.5rem 0.1rem 0.5rem;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08);
`;

export const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.08rem;
  padding: 0.8rem 0.5rem 0.8rem 2.2rem;
  &::placeholder {
    color: #b3b3b3;
    font-size: 1.08rem;
  }
  &:focus { outline: none; }
  position: relative;
`;

export const Icon = styled.span`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #1DB954;
  font-size: 1.2rem;
`;

export const Button = styled.button`
  background: #1ed760;
  color: #18181b;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  cursor: pointer;
  margin-left: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: background 0.2s;
  &:hover { background: #1db954; }
`;