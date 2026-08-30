import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import { errorEnvelope, jsonResponse, makeToken } from '../test/utils';

const fetchMock = vi.fn();

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>product table</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('on 401 shows an error without clearing the entered username', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, errorEnvelope('UNAUTHORIZED', 'Invalid credentials')),
    );
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Usuario'), 'admin');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos');
    expect(screen.getByLabelText('Usuario')).toHaveValue('admin');
    expect(localStorage.getItem('bo_token')).toBeNull();
  });

  it('on success stores the token and redirects', async () => {
    const token = makeToken(3600);
    fetchMock.mockResolvedValue(jsonResponse(200, { token, expiresIn: '12h' }));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Usuario'), 'admin');
    await user.type(screen.getByLabelText('Contraseña'), 'correct');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('product table')).toBeInTheDocument();
    expect(localStorage.getItem('bo_token')).toBe(token);
  });
});
