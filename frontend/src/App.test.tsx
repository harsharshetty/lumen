import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the Lumen V0 shell', () => {
    render(<App />);

    expect(screen.getByText('Lumen V0')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /know what your child should work on next/i })).toBeInTheDocument();
  });
});
