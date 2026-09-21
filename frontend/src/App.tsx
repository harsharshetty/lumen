import { Box, Button, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import ParentOnboardingFlow from './ParentOnboardingFlow';
import type { CurriculumChoice } from './LearnerCurriculumSelection';
import type { LearnerSummary } from './learnerTypes';

const signinArtwork = new URL('./assets/frozen/signin-hero-approved.png', import.meta.url).href;

type FlowState = 'loading' | 'error' | 'forbidden' | 'ready';
type LearnerViewState = FlowState | 'unauthenticated';

type CurriculumResponse = { id: string; name: string; gradeLevel: string; subjectName: string; };
type CurrentUserResponse = { displayName: string; };

const csrfToken = () => document.cookie.split('; ').find((cookie) => cookie.startsWith('XSRF-TOKEN='))?.split('=')[1];

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

const toChoice = (curriculum: CurriculumResponse): CurriculumChoice => ({ id: curriculum.id, name: curriculum.name, subject: curriculum.subjectName, gradeLevel: curriculum.gradeLevel });
const failureState = (reason: unknown): FlowState => (reason as { status?: number }).status === 403 ? 'forbidden' : 'error';
const isUnauthenticated = (result: PromiseSettledResult<unknown>) => result.status === 'rejected' && (result.reason as { status?: number }).status === 401;

function LumenMark() { return <Box component="span" aria-hidden="true" sx={{ display: 'inline-grid', placeItems: 'center', width: 42, height: 42, color: '#1b78ff', fontSize: 38, lineHeight: 1 }}>✦</Box>; }
function GoogleMark() { return <Box component="span" aria-hidden="true" sx={{ mr: 1.5, fontSize: 25, lineHeight: 1, fontWeight: 900, fontFamily: 'Arial, sans-serif', background: 'conic-gradient(from -35deg, #4285f4 0 25%, #34a853 25% 45%, #fbbc05 45% 68%, #ea4335 68% 83%, #4285f4 83% 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G</Box>; }
function Capability({ icon, title, copy, tint }: { icon: string; title: string; copy: string; tint: string }) { return <Stack spacing={1.15} alignItems="center" textAlign="center" sx={{ minWidth: 0 }}><Box aria-hidden="true" sx={{ width: { xs: 54, sm: 66 }, height: { xs: 54, sm: 66 }, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: tint, fontSize: { xs: 24, sm: 30 }, boxShadow: 'inset 0 0 0 1px rgba(16,43,96,0.02)' }}>{icon}</Box><Typography sx={{ fontWeight: 800, color: '#0b1f5e', fontSize: { xs: '0.9rem', sm: '1.03rem' }, lineHeight: 1.25 }}>{title}</Typography><Typography sx={{ color: '#62719a', fontSize: { xs: '0.78rem', sm: '0.88rem' }, lineHeight: 1.45, maxWidth: 170 }}>{copy}</Typography></Stack>; }
function SignInArtwork() { return <Box data-testid="signin-artwork-panel" sx={{ position: 'relative', width: '100%', height: { xs: 'auto', md: '100%' }, aspectRatio: { xs: '1122 / 1402', md: 'auto' }, minWidth: 0, overflow: 'hidden', bgcolor: '#102451' }}><Box component="img" data-testid="signin-hero-artwork" src={signinArtwork} alt="A young learner looking across a mountain valley at sunrise" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: '50% 50%' }} /><Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,26,69,.78) 0%, rgba(7,26,69,.28) 41%, rgba(7,26,69,0) 72%)' }} /><Stack aria-hidden="true" alignItems="center" textAlign="center" sx={{ position: 'absolute', top: { xs: '5.5%', md: '5%' }, left: '8%', right: '8%', color: '#fff' }}><Typography sx={{ fontSize: { xs: '1.7rem', md: '2.3rem' }, fontWeight: 700, lineHeight: 1 }}>✦</Typography><Typography sx={{ mt: 1.5, fontSize: { xs: '2rem', md: '2.55rem' }, fontWeight: 800, letterSpacing: '-0.02em' }}>Lumen</Typography><Typography sx={{ mt: { xs: 2.2, md: 3 }, fontSize: { xs: '1.12rem', md: '1.45rem' }, fontWeight: 800, lineHeight: 1.28 }}>Bright learning for brighter<br />tomorrows</Typography><Typography sx={{ mt: { xs: 2.2, md: 2.6 }, fontSize: { xs: '0.78rem', md: '0.96rem' }, fontWeight: 500, color: '#e7edff', lineHeight: 1.55 }}>Personalised practice. Real progress.<br />For every curious mind.</Typography></Stack></Box>; }
function SignInLanding() { return <Box component="main" sx={{ minHeight: '100vh', p: { xs: 1.5, sm: 3, md: 4 }, display: 'grid', placeItems: 'center', overflowX: 'hidden', background: 'radial-gradient(circle at 15% 12%, rgba(255,255,255,.95), transparent 27%), radial-gradient(circle at 92% 86%, rgba(203,219,249,.85), transparent 25%), #eef4ff' }}><Box sx={{ width: 'min(1330px, 94vw)', minHeight: { xs: 760, md: 'min(795px, calc(100vh - 54px))' }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, borderRadius: { xs: 4, md: '56px' }, overflow: 'hidden', bgcolor: '#fff', boxShadow: '0 34px 90px rgba(44, 72, 125, 0.18)', border: '1px solid rgba(116, 143, 201, 0.10)' }}><SignInArtwork /><Stack sx={{ minWidth: 0, px: { xs: 4, sm: 6, md: 7.5 }, py: { xs: 5, md: 6.5 }, bgcolor: '#fff' }}><Stack direction="row" spacing={1.1} alignItems="center"><LumenMark /><Typography sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' }, fontWeight: 800, color: '#0b1f5e', letterSpacing: '-0.03em' }}>Lumen</Typography></Stack><Box sx={{ mt: { xs: 7, md: 10 } }}><Typography component="h1" sx={{ fontSize: { xs: '2.45rem', md: '3.25rem' }, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#0b1f5e' }}>Welcome back</Typography><Typography sx={{ mt: 1.05, color: '#62719a', fontSize: { xs: '1.05rem', md: '1.24rem' } }}>Sign in to your Lumen account.</Typography></Box><Button variant="outlined" href="/oauth2/authorization/google" sx={{ mt: 4.5, minHeight: 72, borderRadius: 2.5, borderColor: '#d7e0f0', color: '#0b1f5e', bgcolor: '#fff', fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 800, boxShadow: '0 7px 18px rgba(46, 79, 144, 0.06)', '&:hover': { borderColor: '#b9c9e6', bgcolor: '#fff' } }}><GoogleMark />Continue with Google</Button><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: { xs: 1.5, sm: 3 }, mt: { xs: 5, md: 5.2 } }}><Capability icon="📖" title="Personalised practice" copy="Learns with your child to build confidence." tint="#eaf1ff" /><Capability icon="🌱" title="Real progress" copy="Celebrates growth at every step." tint="#e8f7ef" /><Capability icon="💡" title="Curriculum choices" copy="Choose the curricula your child follows." tint="#f1ebff" /></Box><Stack direction="row" spacing={2.3} sx={{ mt: 'auto', pt: { xs: 6, md: 7.5 }, alignItems: 'center' }}><Typography component="a" href="#" sx={{ color: '#1677ff', textDecoration: 'none', fontSize: '0.86rem' }}>Privacy</Typography><Typography sx={{ color: '#b3bfd4' }}>|</Typography><Typography component="a" href="#" sx={{ color: '#1677ff', textDecoration: 'none', fontSize: '0.86rem' }}>Terms</Typography><Typography sx={{ color: '#b3bfd4' }}>|</Typography><Typography component="a" href="#" sx={{ color: '#1677ff', textDecoration: 'none', fontSize: '0.86rem' }}>Help</Typography></Stack><Typography sx={{ mt: 1.4, color: '#7d8cac', fontSize: '0.8rem' }}>© 2026 Lumen.</Typography></Stack></Box></Box>; }

export default function App() {
  const [learnerState, setLearnerState] = useState<LearnerViewState>('loading');
  const [curriculumState, setCurriculumState] = useState<FlowState>('loading');
  const [profileState, setProfileState] = useState<FlowState>('ready');
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [curricula, setCurricula] = useState<CurriculumChoice[]>([]);
  const [selectedByLearner, setSelectedByLearner] = useState<Record<string, string[]>>({});
  const [parentDisplayName, setParentDisplayName] = useState('Account');

  const load = useCallback(async () => {
    setLearnerState('loading'); setCurriculumState('loading'); setProfileState('ready');
    const [learnerResult, curriculumResult, currentUserResult] = await Promise.allSettled([request<LearnerSummary[]>('/api/learners'), request<CurriculumResponse[]>('/api/curricula'), request<CurrentUserResponse>('/api/me')]);
    if (isUnauthenticated(learnerResult) || isUnauthenticated(curriculumResult) || isUnauthenticated(currentUserResult)) { setLearnerState('unauthenticated'); setCurriculumState('error'); setProfileState('error'); return; }
    if (currentUserResult.status === 'fulfilled') setParentDisplayName(currentUserResult.value.displayName.trim() || 'Account');

    if (curriculumResult.status === 'fulfilled') { setCurricula(curriculumResult.value.map(toChoice)); setCurriculumState('ready'); }
    else { setCurriculumState(failureState(curriculumResult.reason)); }

    if (learnerResult.status === 'rejected') { setLearnerState(failureState(learnerResult.reason)); setProfileState(failureState(learnerResult.reason)); return; }
    setLearners(learnerResult.value); setLearnerState('ready');

    const selectionResults = await Promise.allSettled(learnerResult.value.map(async (learner) => [learner.id, (await request<CurriculumResponse[]>(`/api/learners/${learner.id}/curricula`)).map((item) => item.id)] as const));
    const failedSelection = selectionResults.find((result) => result.status === 'rejected');
    if (failedSelection?.status === 'rejected') {
      if ((failedSelection.reason as { status?: number }).status === 401) { setLearnerState('unauthenticated'); setCurriculumState('error'); setProfileState('error'); return; }
      setProfileState(failureState(failedSelection.reason)); return;
    }
    setSelectedByLearner(Object.fromEntries(selectionResults.map((result) => (result as PromiseFulfilledResult<readonly [string, string[]]>).value)));
    setProfileState('ready');
  }, []);

  useEffect(() => { void load(); }, [load]);
  const createLearner = async (displayName: string) => { const learner = await request<LearnerSummary>('/api/learners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName }) }); setLearners((current) => [...current, learner]); setSelectedByLearner((current) => ({ ...current, [learner.id]: [] })); return learner; };
  const logout = async () => {
    const headers = new Headers();
    const token = csrfToken();
    if (token) headers.set('X-XSRF-TOKEN', decodeURIComponent(token));
    const response = await fetch('/logout', { method: 'POST', headers });
    if (!response.ok) throw new Error(`Logout failed: ${response.status}`);
    setLearnerState('unauthenticated');
  };
  const saveCurricula = async (learnerId: string, selectedIds: string[]) => { const currentIds = selectedByLearner[learnerId] ?? []; const current = new Set(currentIds); const next = new Set(selectedIds); await Promise.all([...selectedIds.filter((id) => !current.has(id)).map((id) => request(`/api/learners/${learnerId}/curricula/${id}`, { method: 'POST' })), ...currentIds.filter((id) => !next.has(id)).map((id) => request(`/api/learners/${learnerId}/curricula/${id}`, { method: 'DELETE' }))]); setSelectedByLearner((selections) => ({ ...selections, [learnerId]: selectedIds })); };
  if (learnerState === 'unauthenticated') return <SignInLanding />;
  return <ParentOnboardingFlow learnerState={learnerState} curriculumState={curriculumState} profileState={profileState} learners={learners} curricula={curricula} selectedCurriculumIdsByLearner={selectedByLearner} parentDisplayName={parentDisplayName} onLogout={logout} onRetryLearners={load} onRetryCurricula={load} onRetryProfile={load} onCreateLearner={createLearner} onSaveCurricula={saveCurricula} />;
}
