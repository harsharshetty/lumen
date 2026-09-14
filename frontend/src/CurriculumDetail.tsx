import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { CurriculumDetailModel, LearningConceptSummary } from './curriculumTypes';

type Props = {
  curriculum: CurriculumDetailModel | null;
  concepts: LearningConceptSummary[];
  viewState: 'loading' | 'error' | 'ready' | 'forbidden' | 'notFound';
  errorMessage: string;
  onRetry: () => void;
  onEdit: (curriculumId: string) => void;
};

export default function CurriculumDetail({
  curriculum,
  concepts,
  viewState,
  errorMessage,
  onRetry,
  onEdit,
}: Props) {
  if (viewState === 'loading') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack alignItems="center" spacing={2} aria-live="polite">
          <CircularProgress aria-label="Loading curriculum" />
          <Typography>Loading curriculum…</Typography>
        </Stack>
      </Container>
    );
  }

  if (viewState === 'error') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" action={<Button onClick={onRetry}>Retry</Button>}>
          {errorMessage}
        </Alert>
      </Container>
    );
  }

  if (viewState === 'forbidden') {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="warning">
          You do not have access to curriculum administration.
        </Alert>
      </Container>
    );
  }

  if (viewState === 'notFound' || curriculum === null) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="info">This curriculum could not be found.</Alert>
      </Container>
    );
  }

  const isActive = curriculum.status === 'ACTIVE';

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h1" fontSize="2rem">{curriculum.name}</Typography>
              <Chip
                label={isActive ? 'Active' : 'Inactive'}
                aria-label={`Status: ${isActive ? 'Active' : 'Inactive'}`}
              />
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {curriculum.subjectName} · {curriculum.gradeLevel}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => onEdit(curriculum.id)}>
            Edit curriculum
          </Button>
        </Stack>

        <Divider />

        <Box component="section" aria-labelledby="curriculum-metadata-heading">
          <Typography id="curriculum-metadata-heading" variant="h2" fontSize="1.25rem" gutterBottom>
            Curriculum details
          </Typography>
          <Stack spacing={1}>
            <Typography><strong>Name:</strong> {curriculum.name}</Typography>
            <Typography><strong>Subject:</strong> {curriculum.subjectName}</Typography>
            <Typography><strong>Grade level:</strong> {curriculum.gradeLevel}</Typography>
          </Stack>
        </Box>

        <Divider />

        <Box component="section" aria-labelledby="learning-concepts-heading">
          <Typography id="learning-concepts-heading" variant="h2" fontSize="1.25rem" gutterBottom>
            Learning concepts
          </Typography>
          {concepts.length === 0 ? (
            <Typography color="text.secondary">
              No learning concepts are associated with this curriculum yet.
            </Typography>
          ) : (
            <Stack component="ul" spacing={1} sx={{ pl: 3, my: 0 }}>
              {concepts.map((concept) => (
                <Typography component="li" key={concept.id}>{concept.name}</Typography>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
