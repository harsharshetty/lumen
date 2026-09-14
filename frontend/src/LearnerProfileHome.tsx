import { Alert, Button, Card, CardContent, CircularProgress, Container, Stack, Typography } from '@mui/material';

export type SelectedCurriculum = {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
};

type LearnerProfileHomeProps = {
  learnerName: string;
  curricula: SelectedCurriculum[];
  viewState: 'loading' | 'error' | 'forbidden' | 'ready';
  errorMessage?: string;
  onRetry: () => void;
  onBackToLearners: () => void;
  onEditCurricula: () => void;
};

function groupBySubject(curricula: SelectedCurriculum[]) {
  const groups = new Map<string, SelectedCurriculum[]>();

  curricula.forEach((curriculum) => {
    const existing = groups.get(curriculum.subject);
    if (existing) {
      existing.push(curriculum);
    } else {
      groups.set(curriculum.subject, [curriculum]);
    }
  });

  return [...groups.entries()];
}

export default function LearnerProfileHome({
  learnerName,
  curricula,
  viewState,
  errorMessage,
  onRetry,
  onBackToLearners,
  onEditCurricula,
}: LearnerProfileHomeProps) {
  if (viewState === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress aria-label="Loading learner" />
          <Typography>Loading learner…</Typography>
        </Stack>
      </Container>
    );
  }

  if (viewState === 'error') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={2}>
          <Alert severity="error">{errorMessage ?? "We couldn't load this learner. Try again."}</Alert>
          <Button variant="contained" onClick={onRetry} sx={{ alignSelf: 'flex-start' }}>
            Retry
          </Button>
        </Stack>
      </Container>
    );
  }

  if (viewState === 'forbidden') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">You don't have access to this learner.</Alert>
      </Container>
    );
  }

  const groupedCurricula = groupBySubject(curricula);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Button onClick={onBackToLearners} sx={{ alignSelf: 'flex-start', px: 0 }}>
            Back to learners
          </Button>
          <Typography variant="h3" component="h1">
            {learnerName}
          </Typography>
        </Stack>

        <Stack spacing={2} component="section" aria-labelledby="curricula-heading">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Typography id="curricula-heading" variant="h5" component="h2">
              Curricula
            </Typography>
            <Button variant="contained" onClick={onEditCurricula}>
              {curricula.length === 0 ? 'Choose curricula' : 'Edit curricula'}
            </Button>
          </Stack>

          {curricula.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6" component="h3">
                    No curricula selected yet
                  </Typography>
                  <Typography color="text.secondary">
                    Choose the curricula you want this learner to follow.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={3}>
              {groupedCurricula.map(([subject, subjectCurricula]) => (
                <Stack key={subject} spacing={1.5}>
                  <Typography variant="h6" component="h3">
                    {subject}
                  </Typography>
                  <Stack spacing={1.5}>
                    {subjectCurricula.map((curriculum) => (
                      <Card key={curriculum.id} variant="outlined">
                        <CardContent>
                          <Typography fontWeight={600}>{curriculum.name}</Typography>
                          <Typography color="text.secondary">{curriculum.gradeLevel}</Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
