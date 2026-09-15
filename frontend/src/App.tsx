import { Box, Button, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import ParentOnboardingFlow from './ParentOnboardingFlow';
import type { CurriculumChoice } from './LearnerCurriculumSelection';
import type { LearnerSummary } from './learnerTypes';

type FlowState = 'loading' | 'error' | 'forbidden' | 'ready';
type LearnerViewState = FlowState | 'unauthenticated';

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

function LumenMark() {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 36,
        height: 36,
        color: 'primary.main',
        fontSize: 34,
        lineHeight: 1,
      }}
    >
      ✦
    </Box>
  );
}

function DawnIllustration() {
  return (
    <Box
      component="svg"
      viewBox="0 0 640 390"
      role="img"
      aria-label="A learner looking toward a bright horizon"
      sx={{ width: '100%', display: 'block', mt: 'auto' }}
    >
      <defs>
        <linearGradient id="lumenSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#243d8f" />
          <stop offset="48%" stopColor="#766fb3" />
          <stop offset="100%" stopColor="#f6b36f" />
        </linearGradient>
        <linearGradient id="lumenGround" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#14295c" />
          <stop offset="100%" stopColor="#0b1837" />
        </linearGradient>
      </defs>
      <rect width="640" height="390" fill="url(#lumenSky)" />
      <circle cx="470" cy="225" r="44" fill="#ffe69b" opacity="0.95" />
      <path d="M0 255 L100 188 L184 246 L274 175 L382 248 L470 182 L640 265 V390 H0 Z" fill="#334e92" opacity="0.9" />
      <path d="M0 290 L124 222 L210 278 L320 220 L430 286 L548 215 L640 266 V390 H0 Z" fill="#1f396f" />
      <path d="M0 318 C130 290 210 338 318 300 C420 264 520 314 640 270 V390 H0 Z" fill="url(#lumenGround)" />
      <path d="M360 258 C405 274 426 291 445 329 C463 365 520 363 570 345" fill="none" stroke="#f7d48a" strokeWidth="9" strokeLinecap="round" opacity="0.75" />
      <circle cx="213" cy="243" r="24" fill="#18204a" />
      <path d="M188 275 C196 251 230 249 238 275 L248 344 H177 Z" fill="#18204a" />
      <rect x="176" y="278" width="26" height="58" rx="10" fill="#6f5ba7" />
      <path d="M203 271 C212 278 223 287 232 302" fill="none" stroke="#f0c49d" strokeWidth="8" strokeLinecap="round" />
      <path d="M187 343 L176 378" stroke="#18204a" strokeWidth="11" strokeLinecap="round" />
      <path d="M232 343 L241 378" stroke="#18204a" strokeWidth="11" strokeLinecap="round" />
      <circle cx="90" cy="70" r="3" fill="#fff" opacity="0.85" />
      <circle cx="142" cy="112" r="2" fill="#fff" opacity="0.7" />
      <circle cx="515" cy="72" r="2.5" fill="#fff" opacity="0.9" />
      <circle cx="565" cy="118" r="2" fill="#fff" opacity="0.8" />
    </Box>
  );
}

function Capability({ icon, title, copy, tint }: { icon: string; title: string; copy: string; tint: string }) {
  return (
    <Stack spacing={1.1} alignItems="center" textAlign="center">
      <Box
        aria-hidden="true"
        sx={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: tint,
          fontSize: 26,
        }}
      >
        {icon}
      </Box>
      <Typography fontWeight={800} color="primary.dark">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 170 }}>{copy}</Typography>
    </Stack>
  );
}

function SignInLanding() {
  return (
    <Box component="main" sx={{ minHeight: '100vh', px: { xs: 2, sm: 4 }, py: { xs: 3, md: 5 }, display: 'grid', placeItems: 'center' }}>
      <Box
        sx={{
          width: 'min(1180px, 100%)',
          minHeight: { md: 720 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          borderRadius: { xs: 3, md: 5 },
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 28px 80px rgba(34, 67, 132, 0.18)',
          border: '1px solid rgba(116, 143, 201, 0.18)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 520, md: 'auto' },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#102451',
            color: 'common.white',
          }}
        >
          <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ px: 4, pt: { xs: 5, md: 7 }, zIndex: 1 }}>
            <Typography aria-hidden="true" sx={{ fontSize: 34, lineHeight: 1 }}>✦</Typography>
            <Typography variant="h2" component="div" sx={{ fontSize: { xs: '2.25rem', md: '2.7rem' } }}>Lumen</Typography>
            <Typography variant="h4" component="div" sx={{ maxWidth: 410, fontSize: { xs: '1.55rem', md: '1.85rem' }, lineHeight: 1.25 }}>
              Bright learning for brighter tomorrows
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: { xs: '1rem', md: '1.08rem' } }}>
              Personalised practice. Real progress.<br />For every curious mind.
            </Typography>
          </Stack>
          <DawnIllustration />
        </Box>

        <Stack sx={{ p: { xs: 4, sm: 6, md: 7 }, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LumenMark />
            <Typography variant="h4" component="div" color="primary.dark">Lumen</Typography>
          </Stack>

          <Box sx={{ mt: { xs: 5, md: 8 } }}>
            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2.2rem', md: '3rem' } }}>Welcome back</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.8, fontSize: '1.12rem' }}>
              Sign in to your Lumen account.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            href="/oauth2/authorization/google"
            sx={{ mt: 4, minHeight: 58, borderColor: '#d6dfef', color: 'primary.dark', fontSize: '1rem', bgcolor: '#fff' }}
          >
            <Box component="span" aria-hidden="true" sx={{ mr: 1.5, fontSize: 24, fontWeight: 900, color: '#4285f4' }}>G</Box>
            Continue with Google
          </Button>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: { xs: 1.5, sm: 3 }, mt: 5 }}>
            <Capability icon="▣" title="Personalised practice" copy="Practice shaped around the learner." tint="#eaf1ff" />
            <Capability icon="↗" title="Real progress" copy="See growth as learning continues." tint="#e6f8ef" />
            <Capability icon="◎" title="Curriculum choices" copy="Choose the curricula your child follows." tint="#f0eaff" />
          </Box>

          <Stack direction="row" spacing={2.2} sx={{ mt: 'auto', pt: 7 }}>
            <Typography variant="body2" color="primary.main">Privacy</Typography>
            <Typography variant="body2" color="primary.main">Terms</Typography>
            <Typography variant="body2" color="primary.main">Help</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default function App() {
  const [learnerState, setLearnerState] = useState<LearnerViewState>('loading');
  const [curriculumState, setCurriculumState] = useState<FlowState>('loading');
  const [profileState, setProfileState] = useState<FlowState>('ready');
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
      if (status === 401) {
        setLearnerState('unauthenticated');
        setCurriculumState('error');
        setProfileState('error');
        return;
      }
      const nextState: FlowState = status === 403 ? 'forbidden' : 'error';
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
    return <SignInLanding />;
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
