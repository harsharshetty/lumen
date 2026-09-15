import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import type { LearnerSummary } from './learnerTypes';

type Props = {
  state: 'loading' | 'error' | 'forbidden' | 'ready';
  learners?: LearnerSummary[];
  onRetry: () => void;
  onAddLearner: () => void;
  onOpenLearner: (learner: LearnerSummary) => void;
};

function ParentShell({ children }: { children: ReactNode }) {
  return (
    <Box component="main" sx={{ minHeight: '100vh', py: { xs: 2, md: 4 }, px: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          width: 'min(1260px, 100%)',
          minHeight: { md: 720 },
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
          overflow: 'hidden',
          borderRadius: { xs: 3, md: 5 },
          bgcolor: 'background.paper',
          border: '1px solid rgba(112, 140, 196, 0.16)',
          boxShadow: '0 26px 70px rgba(34, 67, 132, 0.14)',
        }}
      >
        <Box
          component="aside"
          sx={{
            borderRight: { md: '1px solid #e9eef8' },
            borderBottom: { xs: '1px solid #e9eef8', md: 'none' },
            px: 3,
            py: 3.5,
            bgcolor: '#fbfcff',
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            alignItems: { xs: 'center', md: 'stretch' },
            justifyContent: { xs: 'space-between', md: 'flex-start' },
            gap: 3,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography aria-hidden="true" color="primary.main" sx={{ fontSize: 30, lineHeight: 1 }}>✦</Typography>
            <Typography variant="h5" component="div" color="primary.dark" fontWeight={800}>Lumen</Typography>
          </Stack>
          <Paper
            sx={{
              mt: { md: 4 },
              px: 2,
              py: 1.5,
              borderRadius: 2.5,
              bgcolor: '#eaf2ff',
              color: 'primary.dark',
            }}
          >
            <Typography fontWeight={800}>Home</Typography>
          </Paper>
          <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 'auto', p: 2, borderRadius: 3, bgcolor: '#f1f5ff' }}>
            <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
              Small steps today can open bigger possibilities tomorrow.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box
            component="header"
            sx={{
              minHeight: 76,
              px: { xs: 2.5, sm: 4 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              borderBottom: '1px solid #edf1f8',
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar sx={{ width: 38, height: 38, bgcolor: '#6757d9', fontSize: 16 }}>P</Avatar>
              <Typography fontWeight={700} color="primary.dark">Parent</Typography>
            </Stack>
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function LearningLandscape() {
  return (
    <Box sx={{ position: 'relative', height: 210, borderRadius: 3, overflow: 'hidden', bgcolor: '#edf5ff' }}>
      <Box sx={{ position: 'absolute', width: 74, height: 74, borderRadius: '50%', bgcolor: '#ffe49a', right: 34, top: 28 }} />
      <Box sx={{ position: 'absolute', width: 260, height: 180, bgcolor: '#c9dcfa', transform: 'rotate(45deg)', right: -70, bottom: -125, borderRadius: 4 }} />
      <Box sx={{ position: 'absolute', width: 230, height: 170, bgcolor: '#a8c7f2', transform: 'rotate(45deg)', right: 65, bottom: -130, borderRadius: 4 }} />
      <Stack sx={{ position: 'absolute', left: 28, top: 28, maxWidth: 220 }} spacing={1}>
        <Typography variant="h5" color="primary.dark" fontWeight={800}>Support their learning journey.</Typography>
        <Typography variant="body2" color="text.secondary">Open a learner profile to review curricula and continue from where you left off.</Typography>
      </Stack>
    </Box>
  );
}

export default function LearnerLanding({
  state,
  learners = [],
  onRetry,
  onAddLearner,
  onOpenLearner,
}: Props) {
  if (state === 'loading') {
    return (
      <ParentShell>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Stack spacing={2} alignItems="flex-start" aria-live="polite">
            <CircularProgress aria-label="Loading learners" />
            <Typography>Loading your learners…</Typography>
          </Stack>
        </Container>
      </ParentShell>
    );
  }

  if (state === 'error') {
    return (
      <ParentShell>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert
            severity="error"
            action={<Button color="inherit" onClick={onRetry}>Try again</Button>}
          >
            We couldn't load your learners. Try again.
          </Alert>
        </Container>
      </ParentShell>
    );
  }

  if (state === 'forbidden') {
    return (
      <ParentShell>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="warning">You don't have access to this learner.</Alert>
        </Container>
      </ParentShell>
    );
  }

  if (learners.length === 0) {
    return (
      <ParentShell>
        <Box sx={{ p: { xs: 3, sm: 5, md: 6 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 4, alignItems: 'center' }}>
            <Stack spacing={2.5} alignItems="flex-start">
              <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing="0.12em">Welcome to Lumen</Typography>
              <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2.35rem', md: '3.4rem' } }}>Add your first learner</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 580, fontSize: '1.08rem', lineHeight: 1.75 }}>
                Create a learner profile to start choosing the curricula you want to follow.
              </Typography>
              <Button variant="contained" onClick={onAddLearner} sx={{ mt: 1, minWidth: 150 }}>
                Add learner
              </Button>
            </Stack>
            <LearningLandscape />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 5 }}>
            {[
              ['▣', 'Choose curricula', 'Select the curricula this learner should follow.'],
              ['◎', 'Learner profiles', 'Keep each learner’s choices and journey separate.'],
              ['↗', 'Continue anytime', 'Return to a learner profile whenever you need to.'],
            ].map(([icon, title, copy]) => (
              <Paper key={title} variant="outlined" sx={{ p: 2.5, borderColor: '#e2e9f5', borderRadius: 3 }}>
                <Typography aria-hidden="true" color="primary.main" sx={{ fontSize: 24 }}>{icon}</Typography>
                <Typography fontWeight={800} color="primary.dark" sx={{ mt: 1 }}>{title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7, lineHeight: 1.6 }}>{copy}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </ParentShell>
    );
  }

  return (
    <ParentShell>
      <Box sx={{ p: { xs: 3, sm: 5, md: 6 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' }, gap: 4 }}>
          <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Box>
                <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing="0.12em">Parent home</Typography>
                <Typography variant="h2" component="h1" sx={{ mt: 0.5 }}>Learners</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.7 }}>Open a learner profile or add another learner.</Typography>
              </Box>
              <Button variant="contained" onClick={onAddLearner}>Add learner</Button>
            </Stack>

            <Stack spacing={2} sx={{ mt: 4 }}>
              {learners.map((learner, index) => (
                <Paper
                  key={learner.id}
                  variant="outlined"
                  sx={{
                    p: 2.2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderRadius: 3,
                    borderColor: '#e0e7f3',
                    transition: 'transform 120ms ease, box-shadow 120ms ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(34, 67, 132, 0.09)' },
                  }}
                >
                  <Avatar sx={{ width: 52, height: 52, bgcolor: index % 2 === 0 ? '#f6b9cc' : '#b8d9f4', color: 'primary.dark', fontWeight: 800 }}>
                    {learner.displayName.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" component="h2" color="primary.dark" fontWeight={800}>{learner.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">Learner profile</Typography>
                  </Box>
                  <Button onClick={() => onOpenLearner(learner)} variant="text">Open</Button>
                </Paper>
              ))}
            </Stack>
          </Box>

          <LearningLandscape />
        </Box>
      </Box>
    </ParentShell>
  );
}
