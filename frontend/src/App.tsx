import { Container, Stack, Typography, Chip } from '@mui/material';

export default function App() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Chip label="Lumen V0" sx={{ alignSelf: 'flex-start' }} />
        <Typography variant="h2" component="h1">Know what your child should work on next.</Typography>
        <Typography variant="h6" color="text.secondary">
          Lumen turns curriculum, school work and learning evidence into a focused parent-managed learning plan.
        </Typography>
      </Stack>
    </Container>
  );
}
