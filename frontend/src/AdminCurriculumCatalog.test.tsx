import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminCurriculumCatalog, { type CurriculumSummary } from './AdminCurriculumCatalog';

const curricula: CurriculumSummary[] = [
  {
    id: 'math-3',
    title: 'CBSE Grade 3 Mathematics',
    subject: 'Mathematics',
    gradeOrProgram: 'Grade 3',
    status: 'ACTIVE',
  },
  {
    id: 'hindi-3',
    title: 'CBSE Grade 3 Hindi',
    subject: 'Hindi',
    gradeOrProgram: 'Grade 3',
    status: 'INACTIVE',
  },
];

function renderCatalog(options?: {
  viewState?: 'loading' | 'error' | 'ready';
  items?: CurriculumSummary[];
}) {
  const callbacks = {
    onRetry: vi.fn(),
    onCreate: vi.fn(),
    onOpen: vi.fn(),
    onToggleStatus: vi.fn(),
  };

  render(
    <AdminCurriculumCatalog
      curricula={options?.items ?? curricula}
      viewState={options?.viewState ?? 'ready'}
      errorMessage="Unable to load curricula."
      {...callbacks}
    />,
  );

  return callbacks;
}

describe('AdminCurriculumCatalog', () => {
  it('renders a dedicated loading state', () => {
    renderCatalog({ viewState: 'loading' });

    expect(screen.getByLabelText('Loading curricula')).toBeInTheDocument();
    expect(screen.getByText('Loading curricula…')).toBeInTheDocument();
  });

  it('renders an error state with retry', () => {
    const { onRetry } = renderCatalog({ viewState: 'error' });

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load curricula.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders an empty state and starts curriculum creation', () => {
    const { onCreate } = renderCatalog({ items: [] });

    expect(screen.getByRole('heading', { name: 'No curricula yet' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create curriculum' }));
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('renders approved status semantics and primary catalog actions', () => {
    const { onCreate, onOpen, onToggleStatus } = renderCatalog();

    expect(screen.getByRole('heading', { name: 'Curricula' })).toBeInTheDocument();
    expect(screen.getByLabelText('Status: Active')).toBeInTheDocument();
    expect(screen.getByLabelText('Status: Inactive')).toBeInTheDocument();
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create curriculum' }));
    expect(onCreate).toHaveBeenCalledOnce();

    const activeCard = screen.getByText('CBSE Grade 3 Mathematics').closest('.MuiCard-root');
    expect(activeCard).not.toBeNull();
    fireEvent.click(within(activeCard as HTMLElement).getByRole('button', { name: 'Open' }));
    expect(onOpen).toHaveBeenCalledWith('math-3');

    const inactiveCard = screen.getByText('CBSE Grade 3 Hindi').closest('.MuiCard-root');
    expect(inactiveCard).not.toBeNull();
    fireEvent.click(within(inactiveCard as HTMLElement).getByRole('button', { name: 'Activate' }));
    expect(onToggleStatus).toHaveBeenCalledWith('hindi-3', 'ACTIVE');
  });

  it('requires explicit confirmation before deactivation and preserves the approved consequence copy', () => {
    const { onToggleStatus } = renderCatalog();
    const deactivateButton = screen.getByRole('button', { name: 'Deactivate' });

    fireEvent.click(deactivateButton);
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'This curriculum will no longer be available for new learner selection. Existing learner associations are retained.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onToggleStatus).not.toHaveBeenCalledWith('math-3', 'INACTIVE');

    fireEvent.click(deactivateButton);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(deactivateButton);
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate curriculum' }));
    expect(onToggleStatus).toHaveBeenCalledWith('math-3', 'INACTIVE');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
