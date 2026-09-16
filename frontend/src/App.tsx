import { Box, Button, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import ParentOnboardingFlow from './ParentOnboardingFlow';
import type { CurriculumChoice } from './LearnerCurriculumSelection';
import type { LearnerSummary } from './learnerTypes';
import signinArtwork from './assets/signin-left-reference.jpg';

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
        width: 42,
        height: 42,
        color: '#1b78ff',
        fontSize: 38,
        lineHeight: 1,
      }}
    >
      ✦
    </Box>
  );
}

function GoogleMark() {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        mr: 1.5,
        fontSize: 25,
        lineHeight: 1,
        fontWeight: 900,
        fontFamily: 'Arial, sans-serif',
        background: 'conic-gradient(from -35deg, #4285f4 0 25%, #34a853 25% 45%, #fbbc05 45% 68%, #ea4335 68% 83%, #4285f4 83% 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      G
    </Box>
  );
}

function Capability({ icon, title, copy, tint }: { icon: string; title: string; copy: string; tint: string }) {
  return (
    <Stack spacing={1.15} alignItems="center" textAlign="center" sx={{ minWidth: 0 }}>
      <Box
        aria-hidden="true"
        sx={{
          width: { xs: 54, sm: 66 },
          height: { xs: 54, sm: 66 },
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: tint,
          fontSize: { xs: 24, sm: 30 },
          boxShadow: 'inset 0 0 0 1px rgba(16,43,96,0.02)',
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 800, color: '#0b1f5e', fontSize: { xs: '0.9rem', sm: '1.03rem' }, lineHeight: 1.25 }}>
        {title}
      </Typography>
      <Typography sx={{ color: '#62719a', fontSize: { xs: '0.78rem', sm: '0.88rem' }, lineHeight: 1.45, maxWidth: 170 }}>
        {copy}
      </Typography>
    </Stack>
  );
}

function SignInArtwork() {
  return (
    <Box
      data-testid="signin-artwork-panel"
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 'auto', md: '100%' },
        aspectRatio: { xs: '1122 / 1402', md: 'auto' },
        minWidth: 0,
        overflow: 'hidden',
        bgcolor: '#102451',
      }}
    >
      <Box
        component="img"
        src={signinArtwork}
        alt="Lumen — bright learning for brighter tomorrows"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7,26,69,.78) 0%, rgba(7,26,69,.28) 41%, rgba(7,26,69,0) 72%)',
        }}
      />
      <Stack
        aria-hidden="true"
        alignItems="center"
        textAlign="center"
        sx={{
          position: 'absolute',
          top: { xs: '5.5%', md: '5%' },
          left: '8%',
          right: '8%',
          color: '#fff',
        }}
      >
        <Typography sx={{ fontSize: { xs: '1.7rem', md: '2.3rem' }, fontWeight: 700, lineHeight: 1 }}>✦</Typography>
        <Typography sx={{ mt: 1.5, fontSize: { xs: '2rem', md: '2.55rem' }, fontWeight: 800, letterSpacing: '-0.02em' }}>Lumen</Typography>
        <Typography sx={{ mt: { xs: 2.2, md: 3 }, fontSize: { xs: '1.12rem', md: '1.45rem' }, fontWeight: 800, lineHeight: 1.28 }}>
          Bright learning for brighter<br />tomorrows
        </Typography>
        <Typography sx={{ mt: { xs: 2.2, md: 2.6 }, fontSize: { xs: '0.78rem', md: '0.96rem' }, fontWeight: 500, color: '#e7edff', lineHeight: 1.55 }}>
          Personalised practice. Real progress.<br />For every curious mind.
        </Typography>
      </Stack>
    </Box>
  );
}

function SignInLanding() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        p: { xs: 1.5, sm: 3, md: 4 },
        display: 'grid',
        placeItems: 'center',
        overflowX: 'hidden',
        background: 'radial-gradient(circle at 15% 12%, rgba(255,255,255,.95), transparent 27%), radial-gradient(circle at 92% 86%, rgba(203,219,249,.85), transparent 25%), #eef4ff',
      }}
    >
      <Box
        sx={{
          width: 'min(1330px, 94vw)',
          minHeight: { xs: 760, md: 'min(795px, calc(100vh - 54px))' },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          borderRadius: { xs: 4, md: '56px' },
          overflow: 'hidden',
          bgcolor: '#fff',
          boxShadow: '0 34px 90px rgba(44, 72, 125, 0.18)',
          border: '1px solid rgba(116, 143, 201, 0.10)',
        }}
      >
        <SignInArtwork />

        <Stack
          sx={{
            minWidth: 0,
            px: { xs: 4, sm: 6, md: 7.5 },
            py: { xs: 5, md: 6.5 },
            bgcolor: '#fff',
          }}
        >
          <Stack direction="row" spacing={1.1} alignItems="center">
            <LumenMark />
            <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' }, fontWeight: 800, color: '#0b1f5e', letterSpacing: '-0.03em' }}>
              Lumen
            </Typography>
          </Stack>

          <Box sx={{ mt: { xs: 7, md: 10 } }}>
            <Typography component="h1" sx={{ fontSize: { xs: '2.45rem', md: '3.25rem' }, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#0b1f5e' }}>
              Welcome back
            </Typography>
            <Typography sx={{ mt: 1.05, color: '#62719a', fontSize: { xs: '1.05rem', md: '1.24rem' } }}>
              Sign in to your Lumen account.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            href="/oauth2/authorization/google"
            sx={{
              mt: { xs: 4.5, md: 5 },
              minHeight: 72,
              borderRadius: 999,
              borderColor: '#d4def2',
              color: '#0b1f5e',
              fontWeight: 800,
              fontSize: { xs: '1rem', md: '1.08rem' },
              textTransform: 'none',
              boxShadow: '0 12px 26px rgba(65, 91, 145, 0.08)',
              '&:hover': { borderColor: '#aebfe2', bgcolor: '#fbfdff' },
            }}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <Box
            sx={{
              mt: { xs: 5.5, md: 5.2 },
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: { xs: 2, md: 3.5 },
            }}
          >
            <Capability icon="📖" title="Personalised practice" copy="Learns with your child to build confidence." tint="#eef4ff" />
            <Capability icon="🌱" title="Real progress" copy="Celebrates growth at every step." tint="#edf8ef" />
            <Capability icon="💡" title="Curriculum choices" copy="Choose the curricula your child follows." tint="#f4edff" />
          </Box>

          <Box sx={{ mt: 'auto', pt: 5 }}>
            <Stack direction="row" spacing={2.2} sx={{ color: '#1b78ff', fontSize: '0.82rem' }}>
              <Box component="a" href="#" sx={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Box>
              <Box sx={{ color: '#c2cbe0' }}>|</Box>
              <Box component="a" href="#" sx={{ color: 'inherit', textDecoration: 'none' }}>Terms</Box>
              <Box sx={{ color: '#c2cbe0' }}>|</Box>
              <Box component="a" href="#" sx={{ color: 'inherit', textDecoration: 'none' }}>Help</Box>
            </Stack>
            <Typography sx={{ mt: 1.8, color: '#8a98b9', fontSize: '0.76rem' }}>© 2026 Lumen.</Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default function App() {
  const [state, setState] = useState<LearnerViewState>('loading');
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [curricula, setCurricula] = useState<CurriculumChoice[]>([]);
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const [learnerData, curriculumData] = await Promise.all([
        request<LearnerSummary[]>('/api/learners'),
        request<CurriculumResponse[]>('/api/curricula'),
      ]);
      setLearners(learnerData);
      setCurricula(curriculumData.map(toChoice));
      setState('ready');
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 401) setState('unauthenticated');
      else if (status === 403) setState('forbidden');
      else setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state === 'loading') return <Box sx={{ p: 4 }}>Loading…</Box>;
  if (state === 'error') return <Box sx={{ p: 4 }}>Unable to load Lumen right now.</Box>;
  if (state === 'forbidden') return <Box sx={{ p: 4 }}>You do not have access to this workspace.</Box>;
  if (state === 'unauthenticated') return <SignInLanding />;

  return (
    <ParentOnboardingFlow
      learners={learners}
      curricula={curricula}
      selectedLearnerId={selectedLearnerId}
      onSelectLearner={setSelectedLearnerId}
      onRefresh={load}
    />
  );
}
