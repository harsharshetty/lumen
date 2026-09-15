import { Button, Container, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import ParentOnboardingFlow from './ParentOnboardingFlow';
import type { CurriculumChoice } from './LearnerCurriculumSelection';
import type { LearnerSummary } from './learnerTypes';

type ViewState = 'loading' | 'error' | 'forbidden' | 'ready' | 'unauthenticated';

type CurriculumResponse = {
  id: string;
  name: string;
  gradeLevel: string;
  subjectName: string;
};

const csrfToken = () => document.cookie
  .split('; ')
  .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
  ?.split('=')[1];

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.method && init.method !== 'GET') {
    const token = csrfToken();
    if (token) headers.set('X-XSRF-TOKEN', decodeURIComponent(token));
  }
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const error = new Error(`Request failed: ${response.status}`) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const toChoice = (curriculum: CurriculumResponse): CurriculumChoice => ({
  id: curriculum.id,
  name: curriculum.name,
  subject: curriculum.subjectName,
  gradeLevel: curriculum.gradeLevel,
});

export default function App() {
  const [learnerState, setLearnerState] = useState<ViewState>('loading');
  const [curriculumState, setCurriculumState] = useState<ViewState>('loading');
  const [profileState, setProfileState] = useState<ViewState>('ready');
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [curricula, setCurricula] = useState<CurriculumChoice[]>([]);
  const [selectedByLearner, setSelectedByLearner] = useState<Record<string, string[]>>({});

  const load = useCallback(async () => {
    setLearnerState('loading');
    setCurriculumState('loading');
    try {
      const [loadedLearners, loadedCurricula] = await Promise.all([
        request<LearnerSummary[]>('/api/learners'),
        request<CurriculumResponse[]>('/api/curricula'),
      ]);
      const selections = await Promise.all(loadedLearners.map(async (learner) => [
        learner.id,
        (await request<CurriculumResponse[]>(`/api/learners/${learner.id}/curricula`)).map((item) => item.id),
      ] as const));
      setLearners(loadedLearners);
      setCurricula(loadedCurricula.map(toChoice));
      setSelectedByLearner(Object.fromEntries(selections));
      setLearnerState('ready');
      setCurriculumState('ready');
      setProfileState('ready');
    } catch (error) {
      const status = (error as { status?: number }).status;
      const nextState: ViewState = status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'error';
      setLearnerState(nextState);
      setCurriculumState(nextState);
      setProfileState(nextState);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createLearner = async (displayName: string) => {
    const learner = await request<LearnerSummary>('/api/learners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    setLearners((current) => [...current, learner]);
    setSelectedByLearner((current) => ({ ...current, [learner.id]: [] }));
    return learner;
  };

  const saveCurricula = async (learnerId: string, selectedIds: string[]) => {
    const currentIds = selectedByLearner[learnerId] ?? [];
    const current = new Set(currentIds);
    const next = new Set(selectedIds);
    await Promise.all([
      ...selectedIds.filter((id) => !current.has(id)).map((id) => request(`/api/learners/${learnerId}/curricula/${id}`, { method: 'POST' })),
      ...currentIds.filter((id) => !next.has(id)).map((id) => request(`/api/learners/${learnerId}/curricula/${id}`, { method: 'DELETE' })),
    ]);
    setSelectedByLearner((selections) => ({ ...selections, [learnerId]: selectedIds }));
  };

  if (learnerState === 'unauthenticated') {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Stack spacing={3} alignItems="flex-start">
          <Typography variant="h3" component="h1">Welcome to Lumen</Typography>
          <Typography color="text.secondary">
            Sign in to create or continue a learner profile and choose curricula.
          </Typography>
          <Button variant="contained" href="/oauth2/authorization/google">
            Continue with Google
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <ParentOnboardingFlow
      learnerState={learnerState}
      curriculumState={curriculumState}
      profileState={profileState}
      learners={learners}
      curricula={curricula}
      selectedCurriculumIdsByLearner={selectedByLearner}
      onRetryLearners={load}
      onRetryCurricula={load}
      onRetryProfile={load}
      onCreateLearner={createLearner}
      onSaveCurricula={saveCurricula}
    />
  );
}
