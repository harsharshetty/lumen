import { FormEvent, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

type Props = {
  onCancel: () => void;
  onSubmit: (displayName: string) => Promise<void>;
};

export default function LearnerForm({ onCancel, onSubmit }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = displayName.trim();
    setSaveError(null);
    setSaveSucceeded(false);

    if (!trimmedName) {
      setNameError('Learner name is required.');
      return;
    }

    setNameError(null);
    setIsSaving(true);
    try {
      await onSubmit(trimmedName);
      setSaveSucceeded(true);
    } catch {
      setSaveError("We couldn't add this learner. Your entry has been kept so you can try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack component="form" spacing={3} onSubmit={submit} noValidate>
        <Typography variant="h2" component="h1">Add learner</Typography>
        <Typography color="text.secondary">
          Add the name you use to identify this learner in Lumen.
        </Typography>

        {saveError && <Alert severity="error" aria-live="assertive">{saveError}</Alert>}
        {saveSucceeded && <Alert severity="success" aria-live="polite">Learner added</Alert>}

        <TextField
          label="Learner name"
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          error={Boolean(nameError)}
          helperText={nameError}
          disabled={isSaving}
        />

        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
          <Button type="button" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
            aria-label={isSaving ? 'Creating learner' : 'Create learner'}
          >
            {isSaving ? <CircularProgress size={20} aria-hidden="true" /> : 'Create learner'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
