import { FormEvent, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { CurriculumFormValues, SubjectOption } from './curriculumTypes';

type Props = {
  mode: 'create' | 'edit';
  subjects: SubjectOption[];
  initialValues?: CurriculumFormValues;
  onCancel: () => void;
  onSubmit: (values: CurriculumFormValues) => Promise<void>;
};

const emptyValues: CurriculumFormValues = {
  name: '',
  gradeLevel: '',
  subjectId: '',
};

export default function CurriculumForm({
  mode,
  subjects,
  initialValues = emptyValues,
  onCancel,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<CurriculumFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CurriculumFormValues, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSucceeded, setSaveSucceeded] = useState(false);

  const validate = () => {
    const nextErrors: Partial<Record<keyof CurriculumFormValues, string>> = {};
    if (!values.name.trim()) nextErrors.name = 'Name is required.';
    if (!values.gradeLevel.trim()) nextErrors.gradeLevel = 'Grade level is required.';
    if (!values.subjectId) nextErrors.subjectId = 'Subject is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    setSaveSucceeded(false);
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSubmit(values);
      setSaveSucceeded(true);
    } catch {
      setSaveError('Unable to save curriculum. Your changes have been kept so you can retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const title = mode === 'create' ? 'Create curriculum' : 'Edit curriculum';
  const saveLabel = mode === 'create' ? 'Create curriculum' : 'Save changes';

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack component="form" spacing={3} onSubmit={submit} noValidate>
        <Typography variant="h1" fontSize="2rem">{title}</Typography>

        {saveError && <Alert severity="error" aria-live="assertive">{saveError}</Alert>}
        {saveSucceeded && (
          <Alert severity="success" aria-live="polite">
            {mode === 'create' ? 'Curriculum created.' : 'Curriculum updated.'}
          </Alert>
        )}

        <TextField
          label="Name"
          required
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          error={Boolean(errors.name)}
          helperText={errors.name}
          disabled={isSaving}
        />

        <TextField
          label="Grade level"
          required
          value={values.gradeLevel}
          onChange={(event) => setValues({ ...values, gradeLevel: event.target.value })}
          error={Boolean(errors.gradeLevel)}
          helperText={errors.gradeLevel}
          disabled={isSaving}
        />

        <TextField
          select
          label="Subject"
          required
          value={values.subjectId}
          onChange={(event) => setValues({ ...values, subjectId: event.target.value })}
          error={Boolean(errors.subjectId)}
          helperText={errors.subjectId}
          disabled={isSaving}
        >
          {subjects.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
          ))}
        </TextField>

        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
          <Button onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
            aria-label={isSaving ? 'Saving curriculum' : undefined}
          >
            {isSaving ? <CircularProgress size={20} aria-hidden="true" /> : saveLabel}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
