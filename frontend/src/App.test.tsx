import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

let latestProps: any;
vi.mock('./ParentOnboardingFlow', () => ({ default: (props: any) => { latestProps = props; return <div data-testid="flow-state">{props.learnerState}:{props.curriculumState}:{props.profileState}</div>; } }));
const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const emptyResponse = (status: number) => new Response(null, { status });

describe('App', () => {
  beforeEach(() => { latestProps = undefined; vi.restoreAllMocks(); Object.defineProperty(document, 'cookie', { configurable: true, writable: true, value: '' }); });
  afterEach(() => { cleanup(); });

  it('loads learners, active curricula and existing learner selections', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([{ id: 'learner-1', displayName: 'Ava' }])).mockResolvedValueOnce(jsonResponse([{ id: 'curr-1', name: 'CBSE Mathematics', gradeLevel: 'Grade 3', subjectName: 'Mathematics' }])).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })).mockResolvedValueOnce(jsonResponse([{ id: 'curr-1', name: 'CBSE Mathematics', gradeLevel: 'Grade 3', subjectName: 'Mathematics' }]));
    render(<App />);
    expect(screen.getByTestId('flow-state')).toHaveTextContent('loading:loading:ready');
    await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent('ready:ready:ready'));
    expect(latestProps.learners).toEqual([{ id: 'learner-1', displayName: 'Ava' }]); expect(latestProps.curricula).toEqual([{ id: 'curr-1', name: 'CBSE Mathematics', gradeLevel: 'Grade 3', subject: 'Mathematics' }]); expect(latestProps.selectedCurriculumIdsByLearner).toEqual({ 'learner-1': ['curr-1'] }); expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('handles an empty first-time account', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })); render(<App />);
    await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent('ready:ready:ready')); expect(latestProps.learners).toEqual([]); expect(latestProps.curricula).toEqual([]); expect(latestProps.selectedCurriculumIdsByLearner).toEqual({});
  });

  it('shows the frozen branded sign-in entry when any bootstrap API reports unauthenticated', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(emptyResponse(401)).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })); render(<App />);
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument(); expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/oauth2/authorization/google'); expect(screen.getByText('Personalised practice')).toBeInTheDocument(); expect(screen.getByText('Real progress')).toBeInTheDocument(); expect(screen.getByText('Curriculum choices')).toBeInTheDocument(); expect(screen.queryByText('or', { exact: true })).not.toBeInTheDocument(); expect(screen.queryByTestId('flow-state')).not.toBeInTheDocument();
  });

  it('keeps learners available when curriculum catalog loading fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([{ id: 'learner-1', displayName: 'Ava' }])).mockResolvedValueOnce(emptyResponse(500)).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })).mockResolvedValueOnce(jsonResponse([])); render(<App />);
    await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent('ready:error:ready')); expect(latestProps.learners).toEqual([{ id: 'learner-1', displayName: 'Ava' }]); expect(latestProps.curricula).toEqual([]);
  });

  it('keeps curriculum state ready when learner loading fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(emptyResponse(403)).mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })); render(<App />);
    await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent('forbidden:ready:forbidden'));
  });

  it.each([[403, 'ready:ready:forbidden'], [500, 'ready:ready:error']])('isolates learner selection failure %s to profile state', async (status, expected) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([{ id: 'learner-1', displayName: 'Ava' }])).mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })).mockResolvedValueOnce(emptyResponse(status)); render(<App />);
    await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent(expected));
  });

  it('returns to sign-in when learner selection loading reports an expired session', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([{ id: 'learner-1', displayName: 'Ava' }])).mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })).mockResolvedValueOnce(emptyResponse(401)); render(<App />);
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('creates a learner with JSON and CSRF then updates local state', async () => {
    Object.defineProperty(document, 'cookie', { configurable: true, value: 'XSRF-TOKEN=abc%20123' }); const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })).mockResolvedValueOnce(jsonResponse({ id: 'learner-2', displayName: 'Mia' }, 201)); render(<App />); await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent('ready:ready:ready'));
    let created: unknown; await act(async () => { created = await latestProps.onCreateLearner('Mia'); }); expect(created).toEqual({ id: 'learner-2', displayName: 'Mia' }); expect(latestProps.learners).toContainEqual({ id: 'learner-2', displayName: 'Mia' }); expect(latestProps.selectedCurriculumIdsByLearner['learner-2']).toEqual([]); const [, init] = fetchMock.mock.calls[3]; expect(init?.method).toBe('POST'); expect((init?.headers as Headers).get('Content-Type')).toBe('application/json'); expect((init?.headers as Headers).get('X-XSRF-TOKEN')).toBe('abc 123');
  });

  it('adds and removes only changed curriculum selections and accepts 204 responses', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([{ id: 'learner-1', displayName: 'Ava' }])).mockResolvedValueOnce(jsonResponse([{ id: 'curr-1', name: 'Math', gradeLevel: 'Grade 3', subjectName: 'Mathematics' }, { id: 'curr-2', name: 'Olympiad Math', gradeLevel: 'Grade 3', subjectName: 'Mathematics' }])).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })).mockResolvedValueOnce(jsonResponse([{ id: 'curr-1', name: 'Math', gradeLevel: 'Grade 3', subjectName: 'Mathematics' }])).mockResolvedValueOnce(jsonResponse({ id: 'curr-2' })).mockResolvedValueOnce(emptyResponse(204)); render(<App />); await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent('ready:ready:ready')); await act(async () => { await latestProps.onSaveCurricula('learner-1', ['curr-2']); }); expect(fetchMock.mock.calls[5][0]).toBe('/api/learners/learner-1/curricula/curr-2'); expect(fetchMock.mock.calls[5][1]?.method).toBe('POST'); expect(fetchMock.mock.calls[5][0]).toBe('/api/learners/learner-1/curricula/curr-1'); expect(fetchMock.mock.calls[5][1]?.method).toBe('DELETE'); expect(latestProps.selectedCurriculumIdsByLearner['learner-1']).toEqual(['curr-2']);
  });

  it('does not send a CSRF header when the cookie is absent and retries through the shared loader', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse([])).mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' })); render(<App />); await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent('ready:ready:ready')); await act(async () => { await latestProps.onSaveCurricula('unknown', []); await latestProps.onRetryLearners(); }); expect(fetchMock).toHaveBeenCalledTimes(6); expect(latestProps.onRetryLearners).toBe(latestProps.onRetryCurricula); expect(latestProps.onRetryLearners).toBe(latestProps.onRetryProfile);
  });
  it('logs out through the CSRF-protected server endpoint and returns to sign-in', async () => {
    Object.defineProperty(document, 'cookie', { configurable: true, value: 'XSRF-TOKEN=logout%20token' });
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ displayName: 'Harsha' }))
      .mockResolvedValueOnce(new Response('<html></html>', { status: 200 }));
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('flow-state')).toHaveTextContent('ready:ready:ready'));
    await act(async () => { await latestProps.onLogout(); });
    expect(fetchMock.mock.calls[3][0]).toBe('/logout');
    expect(fetchMock.mock.calls[3][1]?.method).toBe('POST');
    expect((fetchMock.mock.calls[3][1]?.headers as Headers).get('X-XSRF-TOKEN')).toBe('logout token');
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });
});
