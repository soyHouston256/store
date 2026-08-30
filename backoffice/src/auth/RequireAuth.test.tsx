import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import { makeToken } from '../test/utils';

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/secret" element={<div>secret content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('redirects to /login when there is no token', () => {
    renderProtected();
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  it('redirects to /login and clears the token when it is expired', () => {
    localStorage.setItem('bo_token', makeToken(-60));
    renderProtected();
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(localStorage.getItem('bo_token')).toBeNull();
  });

  it('renders the protected outlet when the token is valid', () => {
    localStorage.setItem('bo_token', makeToken(3600));
    renderProtected();
    expect(screen.getByText('secret content')).toBeInTheDocument();
    expect(screen.queryByText('login page')).not.toBeInTheDocument();
  });
});
