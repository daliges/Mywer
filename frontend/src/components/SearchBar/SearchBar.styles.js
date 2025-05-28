import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  width: 100%; max-width: 600px;
  background: ${({ theme }) => theme.colors.surface};  /* white background */
  border-radius: 50px;
  padding: 0.5rem;
`;

export const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};  /* black text */
  font-size: 1rem;
  padding: 0 1rem;
  &::placeholder { color: ${({ theme }) => theme.colors.subtext}; }
  &:focus { outline: none; }
`;

export const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary}; /* green */
  color: ${({ theme }) => theme.colors.surface}; /* white icon bg */
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
`;