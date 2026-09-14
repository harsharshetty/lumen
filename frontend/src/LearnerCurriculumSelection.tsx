import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

export type CurriculumChoice = {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
};

type Props = {
  learnerName: string;
  curricula: CurriculumChoice[];
  initialSelectedIds?: string[];
  viewState: 'loading' | 'error' | 'forbidden' | 'ready';
  errorMessage?: string;
  onRetry: () => void;
  onBack: () => void;
  onSave: (selectedIds: string[]) => Promise<void>;
};

export default function LearnerCurriculumSelection({
  learnerName,
  curricula,
  initialSelectedIds = [],
  viewState,
  errorMessage = "We couldn't load curricula. Try again.",
  onRetry,
  onBack,
  onSave,
}: Props) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialSelectedIds));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);

  const curriculaBySubject = useMemo(() => {
    const grouped = new Map<string, CurriculumChoice[]>();
    curricula.forEach((curriculum) => {
      grouped.set(curriculum.subject, [...(grouped.get(curriculum.subject) ?? []), curriculum]);
    });
    return [...grouped.entries()];
  }, [curricula]);

  const toggle = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaveSucceeded(false);
  };

  const save = async () => {
    setSaveError(null);
    setSaveSucceeded(false);
    setIsSaving(true);
    try {
      await onSave([...selectedIds]);
      setSaveSucceeded(true);
    } catch {
      setSaveError('Unable to save curricula. Your selections have been kept so you can retry.');
    } finally {
      setIsSaving(false);
    }
  };

  if (viewState === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={2} alignItems="center" aria-live="polite">
          <CircularProgress aria-label="Loading curricula" />
          <Typography>Loading curricula…</Typography>
        </Stack>
      </Container>
    );
  }

  if (viewState === 'error') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={2}>
          <Alert severity="error">{errorMessage}</Alert>
          <Button onClick={onRetry} sx={{ alignSelf: 'flex-start' }}>Retry</Button>
        </Stack>
      </Container>
    );
  }

  if (viewState === 'forbidden') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning">You don't have access to this learner.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h1" fontSize={{ xs: '2rem', sm: '2.5rem' }}>
            Choose curricula for {learnerName}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Select each curriculum you want this learner to follow. You can choose more than one for a subject.
          </Typography>
        </Box>

        {saveError && <Alert severity="error" aria-live="assertive">{saveError}</Alert>}
        {saveSucceeded && <Alert severity="success" aria-live="polite">Curricula updated</Alert>}

        {curricula.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h2" fontSize="1.35rem">No curricula available yet</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              There aren't any active curricula available to select right now.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {curriculaBySubject.map(([subject, choices]) => (
              <Box component="section" key={subject} aria-labelledby={`subject-${subject}`}>
                <Typography id={`subject-${subject}`} variant="h2" fontSize="1.35rem" sx={{ mb: 1.5 }}>
                  {subject}
                </Typography>
                <Stack spacing={1.25}>
                  {choices.map((curriculum) => (
                    <Paper variant="outlined" sx={{ p: 1.5 }} key={curriculum.id}>
                      <FormControlLabel
                        control={(
                          <Checkbox
                            checked={selectedIds.has(curriculum.id)}
                            onChange={() => toggle(curriculum.id)}
                            disabled={isSaving}
                            inputProps={{
                              'aria-label': `${curriculum.name}, ${curriculum.gradeLevel}`,
                            }}
                          />
                        )}
                        label={(
                          <Box>
                            <Typography fontWeight={600}>{curriculum.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{curriculum.gradeLevel}</Typography>
                          </Box>
                        )}
                      />
                    </Paper>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
          <Button onClick={onBack} disabled={isSaving}>Back</Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={isSaving || curricula.length === 0}
            aria-label={isSaving ? 'Saving curricula' : 'Save curricula'}
          >
            {isSaving ? <CircularProgress size={20} aria-label="Saving curricula progress" /> : 'Save curricula'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
