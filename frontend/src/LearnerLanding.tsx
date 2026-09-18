import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import type { LearnerSummary } from './learnerTypes';

const learnerAvatarSheet = new URL('./assets/frozen/learner-avatars-approved.png', import.meta.url).href;
const parentHomeArtwork = new URL('./assets/frozen/parent-home-approved.png', import.meta.url).href;

type Props = {
  state: 'loading' | 'error' | 'forbidden' | 'ready';
  learners?: LearnerSummary[];
  onRetry: () => void;
  onAddLearner: () => void;
  onOpenLearner: (learner: LearnerSummary) => void;
  parentDisplayName: string;
  onLogout: () => Promise<void>;
  onHome: () => void;
};

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  p: 0,
  m: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function LumenLogo() {
  return (
    <Stack direction="row" spacing={1.1} alignItems="center">
      <Typography aria-hidden="true" sx={{ color: '#1677ff', fontSize: 34, lineHeight: 1 }}>✦</Typography>
      <Typography sx={{ color: '#0b1f5e', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>Lumen</Typography>
    </Stack>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Button
      disabled={!onClick}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      startIcon={<Typography aria-hidden="true" sx={{ fontSize: 23, width: 28, textAlign: 'center' }}>{icon}</Typography>}
      sx={{
        minHeight: 58,
        px: 2.2,
        justifyContent: 'flex-start',
        borderRadius: 2.5,
        color: active ? '#1677ff' : '#1f376d',
        bgcolor: active ? '#e8f2ff' : 'transparent',
        fontWeight: active ? 800 : 600,
        textTransform: 'none',
        '&.Mui-disabled': { color: '#7d8cac' },
      }}
    >
      <Typography sx={{ fontSize: '1rem', fontWeight: 'inherit' }}>{label}</Typography>
    </Button>
  );
}

function ParentShell({ children, parentDisplayName, onLogout, onHome }: { children: ReactNode; parentDisplayName: string; onLogout: () => Promise<void>; onHome: () => void }) {
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null);
  return (
    <Box component="main" sx={{ minHeight: '100vh', bgcolor: '#f7faff', color: '#0b1f3a' }}>
      <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '264px minmax(0, 1fr)' } }}>
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: '#fff',
            borderRight: '1px solid #e8eef8',
            px: 2.2,
            py: 2.5,
          }}
        >
          <Box sx={{ px: 1.5, pt: 0.3, pb: 4.8 }}><LumenLogo /></Box>
          <Stack spacing={1.1}>
            <NavItem icon="⌂" label="Home" active onClick={onHome} />
            <NavItem icon="▤" label="Learn" />
            <NavItem icon="▥" label="Progress" />
            <NavItem icon="▧" label="Resources" />
            <NavItem icon="⚙" label="Settings" />
          </Stack>
          <Box
            sx={{
              mt: 'auto',
              mx: 0.8,
              mb: 1,
              minHeight: 245,
              borderRadius: 3,
              p: 2.6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              color: '#0b1f5e',
              background: 'linear-gradient(180deg, #eef5ff 0%, #e9f2ff 64%, #dbe9ff 100%)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Typography sx={{ position: 'relative', zIndex: 1, fontWeight: 800, fontSize: '1.08rem', lineHeight: 1.45, maxWidth: 170 }}>
              Learning today for bigger tomorrows
            </Typography>
            <Box sx={{ position: 'relative', zIndex: 1, mt: 1.5, width: 56, height: 3, borderRadius: 999, bgcolor: '#1677ff', transform: 'rotate(-7deg)' }} />
            <Box
              component="img"
              src={parentHomeArtwork}
              alt=""
              aria-hidden="true"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: '100% 100%' }}
            />
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box
            component="header"
            sx={{
              height: 76,
              px: { xs: 2.5, sm: 4, lg: 5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#fff',
              borderBottom: '1px solid #e8eef8',
            }}
          >
            <Stack direction="row" spacing={{ xs: 2, md: 5 }} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
              {['Home', 'Learn', 'Progress', 'Resources'].map((item) => (
                <Button
                  key={item}
                  disabled={item !== 'Home'}
                  onClick={item === 'Home' ? onHome : undefined}
                  aria-current={item === 'Home' ? 'page' : undefined}
                  sx={{ minWidth: 0, p: 0, color: item === 'Home' ? '#1677ff' : '#1f376d', fontWeight: item === 'Home' ? 800 : 600, fontSize: '0.96rem', textTransform: 'none', '&.Mui-disabled': { color: '#7d8cac' } }}
                >
                  {item}
                </Button>
              ))}
            </Stack>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}><LumenLogo /></Box>
            <>
              <Button
                aria-label="Parent account"
                aria-haspopup="menu"
                aria-expanded={Boolean(accountAnchor)}
                onClick={(event) => setAccountAnchor(event.currentTarget)}
                sx={{ gap: 1.4, color: '#0b1f5e', textTransform: 'none', borderRadius: 2 }}
              >
                <Typography aria-hidden="true" sx={{ fontSize: 22, color: '#48679c' }}>♢</Typography>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#5d4ddb', fontSize: 16 }}>{parentDisplayName.charAt(0).toUpperCase()}</Avatar>
                <Typography sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>{parentDisplayName}</Typography>
                <Typography aria-hidden="true" sx={{ color: '#35598d' }}>⌄</Typography>
              </Button>
              <Menu anchorEl={accountAnchor} open={Boolean(accountAnchor)} onClose={() => setAccountAnchor(null)}>
                <MenuItem disabled>{parentDisplayName}</MenuItem>
                <MenuItem onClick={() => { setAccountAnchor(null); void onLogout(); }}>Logout</MenuItem>
              </Menu>
            </>
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function MotivationCard() {
  return (
    <Box
      sx={{
        minHeight: 300,
        borderRadius: 3,
        p: 3.5,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#edf5ff',
      }}
    >
      <Box
        component="img"
        src={parentHomeArtwork}
        alt=""
        aria-hidden="true"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: '100% 100%' }}
      />
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(237,245,255,.97) 0%, rgba(237,245,255,.84) 48%, rgba(237,245,255,.12) 100%)' }} />
      <Typography sx={{ position: 'relative', zIndex: 1, color: '#0b1f5e', fontWeight: 800, fontSize: '1.45rem', lineHeight: 1.25, maxWidth: 250 }}>
        Consistent practice builds real progress.
      </Typography>
      <Typography sx={{ position: 'relative', zIndex: 1, mt: 2, color: '#54709e', lineHeight: 1.55, maxWidth: 235 }}>
        Support their learning with the right practice and resources.
      </Typography>
    </Box>
  );
}

function EmptyState({ onAddLearner }: { onAddLearner: () => void }) {
  return (
    <Box sx={{ p: { xs: 3, sm: 5, lg: 6 } }}>
      <Box sx={{ minHeight: 520, display: 'grid', placeItems: 'center' }}>
        <Stack spacing={2.3} alignItems="center" textAlign="center" sx={{ maxWidth: 640 }}>
          <Typography sx={{ color: '#1677ff', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.82rem' }}>Welcome to Lumen</Typography>
          <Typography variant="h2" component="h1" sx={{ color: '#0b1f5e', fontSize: { xs: '2.4rem', md: '3.35rem' } }}>Add your first learner</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1.08rem', lineHeight: 1.75 }}>
            Create a learner profile to start choosing the curricula you want to follow.
          </Typography>
          <Button variant="contained" onClick={onAddLearner} sx={{ minWidth: 160, minHeight: 50, mt: 1 }}>Add learner</Button>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.2} sx={{ pt: 3 }}>
            {[
              ['📖', 'Choose curricula'],
              ['◎', 'Learner profiles'],
              ['↗', 'Continue anytime'],
            ].map(([icon, title]) => (
              <Paper key={title} variant="outlined" sx={{ px: 2.4, py: 2, borderRadius: 3, borderColor: '#e2e9f5', minWidth: 160 }}>
                <Typography aria-hidden="true" sx={{ fontSize: 25 }}>{icon}</Typography>
                <Typography sx={{ mt: 0.8, fontWeight: 800, color: '#0b1f5e' }}>{title}</Typography>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default function LearnerLanding({
  state,
  learners = [],
  onRetry,
  onAddLearner,
  onOpenLearner,
  parentDisplayName,
  onLogout,
  onHome,
}: Props) {
  const shellProps = { parentDisplayName, onLogout, onHome };
  if (state === 'loading') {
    return (
      <ParentShell {...shellProps}>
        <Stack spacing={2} alignItems="flex-start" aria-live="polite" sx={{ p: { xs: 4, md: 8 } }}>
          <CircularProgress aria-label="Loading learners" />
          <Typography>Loading your learners…</Typography>
        </Stack>
      </ParentShell>
    );
  }

  if (state === 'error') {
    return (
      <ParentShell {...shellProps}>
        <Box sx={{ p: { xs: 4, md: 8 } }}>
          <Alert severity="error" action={<Button color="inherit" onClick={onRetry}>Try again</Button>}>
            We couldn't load your learners. Try again.
          </Alert>
        </Box>
      </ParentShell>
    );
  }

  if (state === 'forbidden') {
    return (
      <ParentShell {...shellProps}>
        <Box sx={{ p: { xs: 4, md: 8 } }}>
          <Alert severity="warning">You don't have access to this learner.</Alert>
        </Box>
      </ParentShell>
    );
  }

  if (learners.length === 0) {
    return <ParentShell {...shellProps}><EmptyState onAddLearner={onAddLearner} /></ParentShell>;
  }

  return (
    <ParentShell {...shellProps}>
      <Box sx={{ px: { xs: 3, sm: 5, lg: 5.5 }, py: { xs: 4, lg: 4.5 } }}>
        <Typography component="h2" sx={visuallyHidden}>Learners</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 360px' }, gap: 3.5, alignItems: 'start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }} spacing={2}>
              <Box>
                <Typography component="h1" sx={{ color: '#0b1f5e', fontWeight: 800, fontSize: { xs: '2.2rem', lg: '2.7rem' }, letterSpacing: '-0.035em', lineHeight: 1.08 }}>
                  Good morning!
                </Typography>
                <Typography sx={{ mt: 1, color: '#62719a', fontSize: { xs: '1rem', lg: '1.12rem' } }}>Here’s how your learners are doing.</Typography>
              </Box>
              <Button variant="contained" onClick={onAddLearner} sx={{ minHeight: 52, px: 3, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                ＋ Add learner
              </Button>
            </Stack>

            <Stack spacing={2.1} sx={{ mt: 4 }}>
              {learners.map((learner, index) => (
                <Paper
                  key={learner.id}
                  variant="outlined"
                  sx={{
                    minHeight: 124,
                    px: { xs: 2.2, sm: 3 },
                    py: 2.2,
                    display: 'grid',
                    gridTemplateColumns: { xs: 'auto minmax(0,1fr)', sm: 'auto minmax(0,1fr) minmax(180px,0.72fr) auto' },
                    alignItems: 'center',
                    gap: { xs: 1.6, sm: 2.3 },
                    borderRadius: 3,
                    borderColor: '#e0e7f3',
                    bgcolor: '#fff',
                    boxShadow: '0 8px 24px rgba(45, 75, 132, 0.055)',
                  }}
                >
                  <Box
                    data-testid="learner-avatar"
                    data-avatar-index={index % 3}
                    aria-hidden="true"
                    sx={{
                      width: 68,
                      height: 68,
                      flexShrink: 0,
                      borderRadius: '50%',
                      bgcolor: '#ffd2df',
                      backgroundImage: `url(${learnerAvatarSheet})`,
                      backgroundSize: '300% 100%',
                      backgroundPosition: `${(index % 3) * 50}% center`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: '#0b1f5e', fontWeight: 800, fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {learner.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Learner profile</Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={{ color: '#62719a', fontSize: '0.82rem' }}>Continue learning</Typography>
                    <Typography sx={{ mt: 0.45, color: '#193b7a', fontWeight: 700 }}>Open curricula and profile</Typography>
                  </Box>
                  <Button onClick={() => onOpenLearner(learner)} variant="text" sx={{ minWidth: 48, width: 48, height: 48, p: 0, borderRadius: '50%', fontSize: 28 }} aria-label="Open">
                    ›
                  </Button>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Box sx={{ display: { xs: 'none', xl: 'block' } }}><MotivationCard /></Box>
        </Box>

        <Box sx={{ mt: 4.5 }}>
          <Typography sx={{ color: '#0b1f5e', fontSize: '1.45rem', fontWeight: 800 }}>What would you like to do next?</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.2, mt: 2.2 }}>
            {[
              ['📖', 'Choose curricula', 'Open a learner to review curriculum choices.'],
              ['▥', 'Learner profiles', 'Keep each learner’s journey separate.'],
              ['＋', 'Add learner', 'Create another learner profile.'],
            ].map(([icon, title, copy], index) => (
              <Paper
                key={title}
                variant="outlined"
                onClick={index === 2 ? onAddLearner : undefined}
                sx={{
                  minHeight: 126,
                  p: 2.4,
                  display: 'grid',
                  gridTemplateColumns: '64px minmax(0,1fr)',
                  gap: 1.6,
                  alignItems: 'center',
                  borderRadius: 3,
                  borderColor: '#e2e9f5',
                  bgcolor: '#fff',
                  cursor: index === 2 ? 'pointer' : 'default',
                  boxShadow: '0 8px 22px rgba(45,75,132,.045)',
                }}
              >
                <Box sx={{ width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: index === 0 ? '#ffe8f0' : index === 1 ? '#e7f7ee' : '#efeaff', fontSize: 27 }}>{icon}</Box>
                <Box>
                  <Typography sx={{ color: '#0b1f5e', fontWeight: 800, fontSize: '1.03rem' }}>{title}</Typography>
                  <Typography sx={{ mt: 0.5, color: '#62719a', fontSize: '0.9rem', lineHeight: 1.45 }}>{copy}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            mt: 4.5,
            minHeight: 185,
            borderRadius: 3,
            px: { xs: 3, md: 6 },
            py: 4,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#edf5ff',
          }}
        >
          <Box component="img" data-testid="parent-home-artwork" src={parentHomeArtwork} alt="" aria-hidden="true" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: '100% 100%' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(237,245,255,.98) 0%, rgba(237,245,255,.88) 48%, rgba(237,245,255,.28) 100%)' }} />
          <Typography sx={{ position: 'relative', zIndex: 1, color: '#0b1f5e', fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.65rem' }, lineHeight: 1.35, maxWidth: 560 }}>
            Every step they take today<br />opens up new possibilities tomorrow.
          </Typography>
        </Box>
      </Box>
    </ParentShell>
  );
}
