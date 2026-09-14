import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LearnerProfileHome, { type SelectedCurriculum } from './LearnerProfileHome';

const curricula: SelectedCurriculum[] = [
  { id: 'math-cbse', name: 'CBSE Grade 3 Mathematics', subject: 'Mathematics', gradeLevel: 'Grade 3' },
  { id: 'math-olympiad', name: 'Olympiad Mathematics', subject: 'Mathematics', gradeLevel: 'Grade 3' },
  { id: 'hindi-cbse', name: 'CBSE Grade 3 Hindi', subject: 'Hindi', gradeLevel: 'Grade 3' },
];

function renderProfile(options?: {
  viewState?: 'loading' | 'error' | 'forbidden' | 'ready';
  items?: SelectedCurriculum[];
  errorMessage?: string;
}) {
  const callbacks = {
    onRetry: vi.fn(),
    onBackToLearners: vi.fn(),
    onEditCurricula: vi.fn(),
  };

  render(
    <LearnerProfileHome
      learnerName="Anya"
      curricula={options?.items ?? curricula}
      viewState={options?.viewState ?? 'ready'}
      errorMessage={options?.errorMessage}
      {...callbacks}
    />,
  );

  return callbacks;
}

afterEach(() => cleanup());

describe('LearnerProfileHome', () => {
  it('renders a real loading state', () => {
    renderProfile({ viewState: 'loading' });

    expect(screen.getByLabelText('Loading learner')).toBeInTheDocument();
    expect(screen.getByText('Loading learner…')).toBeInTheDocument();
  });

  it('renders a recoverable load error with supplied copy', () => {
    const { onRetry } = renderProfile({ viewState: 'error', errorMessage: 'Learner unavailable.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Learner unavailable.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('uses safe default error copy', () => {
    renderProfile({ viewState: 'error' });

    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load this learner. Try again.");
  });

  it('renders forbidden without leaking learner details', () => {
    renderProfile({ viewState: 'forbidden' });

    expect(screen.getByRole('alert')).toHaveTextContent("You don't have access to this learner.");
    expect(screen.queryByText('Anya')).not.toBeInTheDocument();
  });

  it('renders the no-curricula state and starts curriculum selection', () => {
    const { onBackToLearners, onEditCurricula } = renderProfile({ items: [] });

    expect(screen.getByRole('heading', { name: 'Anya' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No curricula selected yet' })).toBeInTheDocument();
    expect(screen.getByText('Choose the curricula you want this learner to follow.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Choose curricula' }));
    expect(onEditCurricula).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Back to learners' }));
    expect(onBackToLearners).toHaveBeenCalledOnce();
  });

  it('shows selected curricula grouped by subject and allows editing', () => {
    const { onEditCurricula } = renderProfile();

    expect(screen.getByRole('heading', { name: 'Curricula' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mathematics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hindi' })).toBeInTheDocument();
    expect(screen.getByText('CBSE Grade 3 Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Olympiad Mathematics')).toBeInTheDocument();
    expect(screen.getByText('CBSE Grade 3 Hindi')).toBeInTheDocument();
    expect(screen.getAllByText('Grade 3')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Edit curricula' }));
    expect(onEditCurricula).toHaveBeenCalledOnce();
  });
});
