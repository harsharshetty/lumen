import { useMemo, useState } from 'react';
import LearnerCurriculumSelection, { type CurriculumChoice } from './LearnerCurriculumSelection';
import LearnerForm from './LearnerForm';
import LearnerLanding from './LearnerLanding';
import LearnerProfileHome from './LearnerProfileHome';
import type { LearnerSummary } from './learnerTypes';

type ViewState = 'loading' | 'error' | 'forbidden' | 'ready';
type Screen = 'learners' | 'create' | 'curricula' | 'profile';
type SelectionOrigin = 'create' | 'profile';

type ParentOnboardingFlowProps = {
  learnerState: ViewState;
  curriculumState: ViewState;
  profileState: ViewState;
  learners: LearnerSummary[];
  curricula: CurriculumChoice[];
  selectedCurriculumIdsByLearner: Record<string, string[]>;
  onRetryLearners: () => void;
  onRetryCurricula: () => void;
  onRetryProfile: () => void;
  onCreateLearner: (displayName: string) => Promise<LearnerSummary>;
  onSaveCurricula: (learnerId: string, selectedIds: string[]) => Promise<void>;
  onLogout: () => Promise<void>;
};

export default function ParentOnboardingFlow({
  learnerState,
  curriculumState,
  profileState,
  learners,
  curricula,
  selectedCurriculumIdsByLearner,
  onRetryLearners,
  onRetryCurricula,
  onRetryProfile,
  onCreateLearner,
  onSaveCurricula,
  onLogout,
}: ParentOnboardingFlowProps) {
  const [screen, setScreen] = useState<Screen>('learners');
  const [activeLearner, setActiveLearner] = useState<LearnerSummary | null>(null);
  const [selectionOrigin, setSelectionOrigin] = useState<SelectionOrigin>('profile');
  const [locallySavedSelections, setLocallySavedSelections] = useState<Record<string, string[]>>({});

  const activeSelectedIds = activeLearner
    ? locallySavedSelections[activeLearner.id]
      ?? selectedCurriculumIdsByLearner[activeLearner.id]
      ?? []
    : [];

  const selectedCurricula = useMemo(() => {
    const selected = new Set(activeSelectedIds);
    return curricula.filter((curriculum) => selected.has(curriculum.id));
  }, [activeSelectedIds, curricula]);

  if (screen === 'create') {
    return (
      <LearnerForm
        onCancel={() => setScreen('learners')}
        onSubmit={async (displayName) => {
          const learner = await onCreateLearner(displayName);
          setActiveLearner(learner);
          setSelectionOrigin('create');
          setScreen('curricula');
        }}
      />
    );
  }

  if (screen === 'curricula' && activeLearner) {
    return (
      <LearnerCurriculumSelection
        learnerName={activeLearner.displayName}
        curricula={curricula}
        initialSelectedIds={activeSelectedIds}
        viewState={curriculumState}
        onRetry={onRetryCurricula}
        onBack={() => setScreen(selectionOrigin === 'profile' ? 'profile' : 'learners')}
        onSave={async (selectedIds) => {
          await onSaveCurricula(activeLearner.id, selectedIds);
          setLocallySavedSelections((current) => ({ ...current, [activeLearner.id]: selectedIds }));
          setSelectionOrigin('profile');
          setScreen('profile');
        }}
      />
    );
  }

  if (screen === 'profile' && activeLearner) {
    return (
      <LearnerProfileHome
        learnerName={activeLearner.displayName}
        curricula={selectedCurricula}
        viewState={profileState}
        onRetry={onRetryProfile}
        onBackToLearners={() => setScreen('learners')}
        onEditCurricula={() => {
          setSelectionOrigin('profile');
          setScreen('curricula');
        }}
      />
    );
  }

  return (
    <LearnerLanding
      state={learnerState}
      learners={learners}
      onRetry={onRetryLearners}
      onAddLearner={() => setScreen('create')}
      onOpenLearner={(learner) => {
        setActiveLearner(learner);
        setScreen('profile');
      }}
      onLogout={onLogout}
    />
  );
}
