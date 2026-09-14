import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ParentOnboardingFlow from './ParentOnboardingFlow';
import type { CurriculumChoice } from './LearnerCurriculumSelection';
import type { LearnerSummary } from './learnerTypes';

const curricula: CurriculumChoice[] = [
  { id: 'math-cbse', name: 'CBSE Grade 3 Mathematics', subject: 'Mathematics', gradeLevel: 'Grade 3' },
  { id: 'math-olympiad', name: 'Olympiad Mathematics', subject: 'Mathematics', gradeLevel: 'Grade 3' },
  { id: 'hindi-cbse', name: 'CBSE Grade 3 Hindi', subject: 'Hindi', gradeLevel: 'Grade 3' },
];

function renderFlow(options?: {
  learners?: LearnerSummary[];
  selections?: Record<string, string[]>;
}) {
  const onCreateLearner = vi.fn(async (displayName: string) => ({ id: 'new-learner', displayName }));
  const onSaveCurricula = vi.fn(async () => undefined);

  render(
    <ParentOnboardingFlow
      learnerState="ready"
      curriculumState="ready"
      profileState="ready"
      learners={options?.learners ?? []}
      curricula={curricula}
      selectedCurriculumIdsByLearner={options?.selections ?? {}}
      onRetryLearners={vi.fn()}
      onRetryCurricula={vi.fn()}
      onRetryProfile={vi.fn()}
      onCreateLearner={onCreateLearner}
      onSaveCurricula={onSaveCurricula}
    />,
  );

  return { onCreateLearner, onSaveCurricula };
}

afterEach(() => cleanup());

describe('ParentOnboardingFlow', () => {
  it('connects first learner creation through curriculum selection to the learner profile', async () => {
    const { onCreateLearner, onSaveCurricula } = renderFlow();

    fireEvent.click(screen.getByRole('button', { name: 'Add learner' }));
    fireEvent.change(screen.getByLabelText(/Learner name/), { target: { value: 'Anya' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create learner' }));

    expect(await screen.findByRole('heading', { name: 'Choose curricula for Anya' })).toBeInTheDocument();
    expect(onCreateLearner).toHaveBeenCalledWith('Anya');

    fireEvent.click(screen.getByRole('checkbox', { name: 'CBSE Grade 3 Mathematics, Grade 3' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Olympiad Mathematics, Grade 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save curricula' }));

    expect(await screen.findByRole('heading', { name: 'Anya' })).toBeInTheDocument();
    expect(screen.getByText('CBSE Grade 3 Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Olympiad Mathematics')).toBeInTheDocument();
    expect(onSaveCurricula).toHaveBeenCalledWith(
      'new-learner',
      expect.arrayContaining(['math-cbse', 'math-olympiad']),
    );
  });

  it('opens an existing learner, edits curricula, persists the updated local view, and returns to learners', async () => {
    const learner = { id: 'anya', displayName: 'Anya' };
    const { onSaveCurricula } = renderFlow({
      learners: [learner],
      selections: { anya: ['hindi-cbse'] },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('heading', { name: 'Anya' })).toBeInTheDocument();
    expect(screen.getByText('CBSE Grade 3 Hindi')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit curricula' }));
    expect(screen.getByRole('checkbox', { name: 'CBSE Grade 3 Hindi, Grade 3' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'CBSE Grade 3 Mathematics, Grade 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save curricula' }));

    expect(await screen.findByText('CBSE Grade 3 Mathematics')).toBeInTheDocument();
    expect(screen.getByText('CBSE Grade 3 Hindi')).toBeInTheDocument();
    expect(onSaveCurricula).toHaveBeenCalledWith(
      'anya',
      expect.arrayContaining(['hindi-cbse', 'math-cbse']),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back to learners' }));
    expect(screen.getByRole('heading', { name: 'Learners' })).toBeInTheDocument();
  });

  it('returns to the learner landing when learner creation is cancelled', () => {
    renderFlow();

    fireEvent.click(screen.getByRole('button', { name: 'Add learner' }));
    expect(screen.getByRole('heading', { name: 'Add learner' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Add your first learner' })).toBeInTheDocument();
  });
});
