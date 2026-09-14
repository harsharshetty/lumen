package com.lumen.service;

import com.lumen.domain.Curriculum;
import com.lumen.domain.CurriculumConcept;
import com.lumen.domain.Learner;
import com.lumen.domain.LearnerCurriculum;
import com.lumen.domain.LearningConcept;
import com.lumen.domain.Subject;
import com.lumen.repository.CurriculumConceptRepository;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.LearnerCurriculumRepository;
import com.lumen.repository.LearnerRepository;
import com.lumen.repository.LearningConceptRepository;
import com.lumen.service.impl.CurriculumConceptServiceImpl;
import com.lumen.service.impl.LearnerCurriculumServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AssociationServicesTest {

    @Test
    void curriculumConceptServiceAddsListsSkipsDuplicatesAndValidatesReferences() {
        CurriculumConceptRepository linkRepository = mock(CurriculumConceptRepository.class);
        CurriculumRepository curriculumRepository = mock(CurriculumRepository.class);
        LearningConceptRepository conceptRepository = mock(LearningConceptRepository.class);
        CurriculumConceptService service = new CurriculumConceptServiceImpl(linkRepository, curriculumRepository, conceptRepository);

        UUID curriculumId = UUID.randomUUID();
        UUID conceptId = UUID.randomUUID();
        Subject subject = new Subject("Mathematics");
        Curriculum curriculum = new Curriculum("CBSE Grade 3 Mathematics", "3", subject);
        LearningConcept concept = new LearningConcept("Fractions");
        CurriculumConcept link = new CurriculumConcept(curriculum, concept);

        when(linkRepository.existsByCurriculumIdAndLearningConceptId(curriculumId, conceptId)).thenReturn(false);
        when(curriculumRepository.findById(curriculumId)).thenReturn(Optional.of(curriculum));
        when(conceptRepository.findById(conceptId)).thenReturn(Optional.of(concept));
        when(linkRepository.findByCurriculumId(curriculumId)).thenReturn(List.of(link));

        service.addLearningConceptToCurriculum(curriculumId, conceptId);
        verify(linkRepository).save(any(CurriculumConcept.class));
        assertThat(service.listLearningConceptsForCurriculum(curriculumId)).containsExactly(concept);

        UUID duplicateCurriculumId = UUID.randomUUID();
        UUID duplicateConceptId = UUID.randomUUID();
        when(linkRepository.existsByCurriculumIdAndLearningConceptId(duplicateCurriculumId, duplicateConceptId)).thenReturn(true);
        service.addLearningConceptToCurriculum(duplicateCurriculumId, duplicateConceptId);
        verify(curriculumRepository, never()).findById(duplicateCurriculumId);

        UUID missingCurriculumId = UUID.randomUUID();
        when(linkRepository.existsByCurriculumIdAndLearningConceptId(missingCurriculumId, conceptId)).thenReturn(false);
        when(curriculumRepository.findById(missingCurriculumId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.addLearningConceptToCurriculum(missingCurriculumId, conceptId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Curriculum not found: " + missingCurriculumId);

        UUID missingConceptId = UUID.randomUUID();
        when(linkRepository.existsByCurriculumIdAndLearningConceptId(curriculumId, missingConceptId)).thenReturn(false);
        when(curriculumRepository.findById(curriculumId)).thenReturn(Optional.of(curriculum));
        when(conceptRepository.findById(missingConceptId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.addLearningConceptToCurriculum(curriculumId, missingConceptId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Learning concept not found: " + missingConceptId);
    }

    @Test
    void learnerCurriculumServiceEnrollsListsSkipsDuplicatesAndValidatesReferences() {
        LearnerCurriculumRepository linkRepository = mock(LearnerCurriculumRepository.class);
        LearnerRepository learnerRepository = mock(LearnerRepository.class);
        CurriculumRepository curriculumRepository = mock(CurriculumRepository.class);
        LearnerCurriculumService service = new LearnerCurriculumServiceImpl(linkRepository, learnerRepository, curriculumRepository);

        UUID learnerId = UUID.randomUUID();
        UUID curriculumId = UUID.randomUUID();
        Learner learner = new Learner("Aarav");
        Subject subject = new Subject("Mathematics");
        Curriculum curriculum = new Curriculum("CBSE Grade 3 Mathematics", "3", subject);
        LearnerCurriculum link = new LearnerCurriculum(learner, curriculum);

        when(linkRepository.existsByLearnerIdAndCurriculumId(learnerId, curriculumId)).thenReturn(false);
        when(learnerRepository.findById(learnerId)).thenReturn(Optional.of(learner));
        when(curriculumRepository.findById(curriculumId)).thenReturn(Optional.of(curriculum));
        when(linkRepository.findByLearnerId(learnerId)).thenReturn(List.of(link));

        service.enrollLearnerInCurriculum(learnerId, curriculumId);
        verify(linkRepository).save(any(LearnerCurriculum.class));
        assertThat(service.listCurriculaForLearner(learnerId)).containsExactly(curriculum);

        UUID duplicateLearnerId = UUID.randomUUID();
        UUID duplicateCurriculumId = UUID.randomUUID();
        when(linkRepository.existsByLearnerIdAndCurriculumId(duplicateLearnerId, duplicateCurriculumId)).thenReturn(true);
        service.enrollLearnerInCurriculum(duplicateLearnerId, duplicateCurriculumId);
        verify(learnerRepository, never()).findById(duplicateLearnerId);

        UUID missingLearnerId = UUID.randomUUID();
        when(linkRepository.existsByLearnerIdAndCurriculumId(missingLearnerId, curriculumId)).thenReturn(false);
        when(learnerRepository.findById(missingLearnerId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.enrollLearnerInCurriculum(missingLearnerId, curriculumId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Learner not found: " + missingLearnerId);

        UUID missingCurriculumId = UUID.randomUUID();
        when(linkRepository.existsByLearnerIdAndCurriculumId(learnerId, missingCurriculumId)).thenReturn(false);
        when(learnerRepository.findById(learnerId)).thenReturn(Optional.of(learner));
        when(curriculumRepository.findById(missingCurriculumId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.enrollLearnerInCurriculum(learnerId, missingCurriculumId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Curriculum not found: " + missingCurriculumId);
    }
}
