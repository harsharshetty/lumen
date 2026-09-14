import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import type { LearnerSummary } from './learnerTypes';

type Props = {
  state: 'loading' | 'error' | 'forbidden' | 'ready';
  learners?: LearnerSummary[];
  onRetry: () => void;
  onAddLearner: () => void;
  onOpenLearner: (learner: LearnerSummary) => void;
};

export default function LearnerLanding({
  state,
  learners = [],
  onRetry,
  onAddLearner,
  onOpenLearner,
}: Props) {
  if (state === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={2} alignItems="flex-start" aria-live="polite">
          <CircularProgress aria-label="Loading learners" />
          <Typography>Loading your learners…</Typography>
        </Stack>
      </Container>
    );
  }

  if (state === 'error') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert
          severity="error"
          action={<Button color="inherit" onClick={onRetry}>Try again</Button>}
        >
          We couldn't load your learners. Try again.
        </Alert>
      </Container>
    );
  }

  if (state === 'forbidden') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning">You don't have access to this learner.</Alert>
      </Container>
    );
  }

  if (learners.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="flex-start">
          <Typography variant="h2" component="h1">Add your first learner</Typography>
          <Typography color="text.secondary">
            Create a learner profile to start choosing the curricula you want to follow.
          </Typography>
          <Button variant="contained" onClick={onAddLearner}>Add learner</Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Typography variant="h2" component="h1">Learners</Typography>
          <Button variant="contained" onClick={onAddLearner}>Add learner</Button>
        </Stack>
        <Stack spacing={2}>
          {learners.map((learner) => (
            <Card key={learner.id} variant="outlined">
              <CardContent>
                <Typography variant="h6" component="h2">{learner.displayName}</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => onOpenLearner(learner)}>Open</Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
