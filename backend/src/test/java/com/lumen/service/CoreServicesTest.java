package com.lumen.service;

import com.lumen.domain.Curriculum;
import com.lumen.domain.LearningConcept;
import com.lumen.domain.Subject;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.LearningConceptRepository;
import com.lumen.repository.SubjectRepository;
import com.lumen.service.impl.CurriculumServiceImpl;
import com.lumen.service.impl.LearningConceptServiceImpl;
import com.lumen.service.impl.SubjectServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CoreServicesTest {

    @Test
    void subjectServiceCoversCreateGetListAndMissingSubject() {
        SubjectRepository repository = mock(SubjectRepository.class);
        SubjectService service = new SubjectServiceImpl(repository);
        Subject saved = new Subject("Mathematics");
        UUID id = UUID.randomUUID();

        when(repository.save(any(Subject.class))).thenReturn(saved);
        when(repository.findById(id)).thenReturn(Optional.of(saved));
        when(repository.findAll()).thenReturn(List.of(saved));

        assertThat(service.createSubject("Mathematics")).isSameAs(saved);
        assertThat(service.getSubject(id)).isSameAs(saved);
        assertThat(service.listSubjects()).containsExactly(saved);
        verify(repository).save(any(Subject.class));

        UUID missingId = UUID.randomUUID();
        when(repository.findById(missingId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getSubject(missingId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Subject not found: " + missingId);
    }

    @Test
    void curriculumServiceCoversCreateGetListAndMissingReferences() {
        CurriculumRepository curriculumRepository = mock(CurriculumRepository.class);
        SubjectRepository subjectRepository = mock(SubjectRepository.class);
        CurriculumService service = new CurriculumServiceImpl(curriculumRepository, subjectRepository);
        Subject subject = new Subject("Mathematics");
        Curriculum saved = new Curriculum("CBSE Grade 3 Mathematics", "3", subject);
        UUID subjectId = UUID.randomUUID();
        UUID curriculumId = UUID.randomUUID();

        when(subjectRepository.findById(subjectId)).thenReturn(Optional.of(subject));
        when(curriculumRepository.save(any(Curriculum.class))).thenReturn(saved);
        when(curriculumRepository.findById(curriculumId)).thenReturn(Optional.of(saved));
        when(curriculumRepository.findAll()).thenReturn(List.of(saved));

        assertThat(service.createCurriculum("CBSE Grade 3 Mathematics", "3", subjectId)).isSameAs(saved);
        assertThat(service.getCurriculum(curriculumId)).isSameAs(saved);
        assertThat(service.listCurricula()).containsExactly(saved);
        verify(curriculumRepository).save(any(Curriculum.class));

        UUID missingSubjectId = UUID.randomUUID();
        when(subjectRepository.findById(missingSubjectId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.createCurriculum("Olympiad", "3", missingSubjectId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Subject not found: " + missingSubjectId);

        UUID missingCurriculumId = UUID.randomUUID();
        when(curriculumRepository.findById(missingCurriculumId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getCurriculum(missingCurriculumId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Curriculum not found: " + missingCurriculumId);
    }

    @Test
    void learningConceptServiceCoversCreateGetListAndMissingConcept() {
        LearningConceptRepository repository = mock(LearningConceptRepository.class);
        LearningConceptService service = new LearningConceptServiceImpl(repository);
        LearningConcept saved = new LearningConcept("Fractions");
        UUID id = UUID.randomUUID();

        when(repository.save(any(LearningConcept.class))).thenReturn(saved);
        when(repository.findById(id)).thenReturn(Optional.of(saved));
        when(repository.findAll()).thenReturn(List.of(saved));

        assertThat(service.createLearningConcept("Fractions")).isSameAs(saved);
        assertThat(service.getLearningConcept(id)).isSameAs(saved);
        assertThat(service.listLearningConcepts()).containsExactly(saved);
        verify(repository).save(any(LearningConcept.class));

        UUID missingId = UUID.randomUUID();
        when(repository.findById(missingId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getLearningConcept(missingId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Learning concept not found: " + missingId);
    }
}
