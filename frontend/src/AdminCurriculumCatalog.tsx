import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

export type CurriculumStatus = 'ACTIVE' | 'INACTIVE';

export type CurriculumSummary = {
  id: string;
  title: string;
  subject: string;
  gradeOrProgram: string;
  status: CurriculumStatus;
};

type Props = {
  curricula: CurriculumSummary[];
  viewState: 'loading' | 'error' | 'ready';
  errorMessage: string;
  onRetry: () => void;
  onCreate: () => void;
  onOpen: (curriculumId: string) => void;
  onToggleStatus: (curriculumId: string, nextStatus: CurriculumStatus) => void;
};

export default function AdminCurriculumCatalog({
  curricula,
  viewState,
  errorMessage,
  onRetry,
  onCreate,
  onOpen,
  onToggleStatus,
}: Props) {
  const [pendingDeactivation, setPendingDeactivation] = useState<CurriculumSummary | null>(null);

  if (viewState === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack alignItems="center" spacing={2} aria-live="polite">
          <CircularProgress aria-label="Loading curricula" />
          <Typography>Loading curricula…</Typography>
        </Stack>
      </Container>
    );
  }

  if (viewState === 'error') {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" action={<Button onClick={onRetry}>Retry</Button>}>
          {errorMessage}
        </Alert>
      </Container>
    );
  }

  if (curricula.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h1" fontSize="2rem">Curricula</Typography>
          <Typography variant="h2" fontSize="1.25rem">No curricula yet</Typography>
          <Typography color="text.secondary">
            Create the first canonical curriculum to make it available for administration.
          </Typography>
          <Button variant="contained" onClick={onCreate}>Create curriculum</Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h1" fontSize="2rem">Curricula</Typography>
            <Typography color="text.secondary">
              Manage Lumen's canonical curriculum catalog.
            </Typography>
          </Box>
          <Button variant="contained" onClick={onCreate}>Create curriculum</Button>
        </Stack>

        <Stack spacing={2}>
          {curricula.map((curriculum) => {
            const isActive = curriculum.status === 'ACTIVE';
            return (
              <Card key={curriculum.id} variant="outlined">
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="h2" fontSize="1.2rem">{curriculum.title}</Typography>
                      <Typography color="text.secondary">
                        {curriculum.subject} · {curriculum.gradeOrProgram}
                      </Typography>
                    </Box>
                    <Chip label={isActive ? 'Active' : 'Inactive'} aria-label={`Status: ${isActive ? 'Active' : 'Inactive'}`} />
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button onClick={() => onOpen(curriculum.id)}>Open</Button>
                  {isActive ? (
                    <Button onClick={() => setPendingDeactivation(curriculum)}>Deactivate</Button>
                  ) : (
                    <Button onClick={() => onToggleStatus(curriculum.id, 'ACTIVE')}>Activate</Button>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Stack>
      </Stack>

      <Dialog
        open={pendingDeactivation !== null}
        onClose={() => setPendingDeactivation(null)}
        aria-labelledby="deactivate-curriculum-title"
      >
        <DialogTitle id="deactivate-curriculum-title">Deactivate curriculum?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This curriculum will no longer be available for new learner selection. Existing learner associations are retained.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDeactivation(null)}>Cancel</Button>
          <Button
            onClick={() => {
              if (pendingDeactivation !== null) {
                onToggleStatus(pendingDeactivation.id, 'INACTIVE');
              }
              setPendingDeactivation(null);
            }}
          >
            Deactivate curriculum
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
