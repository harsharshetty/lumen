package com.lumen.repository;

import com.lumen.domain.Curriculum;
import com.lumen.domain.CurriculumConcept;
import com.lumen.domain.Learner;
import com.lumen.domain.LearnerCurriculum;
import com.lumen.domain.LearningConcept;
import com.lumen.domain.Subject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class RepositoryIntegrationTest {

    @Autowired SubjectRepository subjectRepository;
    @Autowired CurriculumRepository curriculumRepository;
    @Autowired LearningConceptRepository learningConceptRepository;
    @Autowired CurriculumConceptRepository curriculumConceptRepository;
    @Autowired LearnerRepository learnerRepository;
    @Autowired LearnerCurriculumRepository learnerCurriculumRepository;

    @Test
    void repositoriesPersistAndQueryV0Relationships() {
        Subject subject = subjectRepository.save(new Subject("Mathematics"));
        Curriculum curriculum = curriculumRepository.save(new Curriculum("CBSE Grade 3 Mathematics", "3", subject));
        LearningConcept concept = learningConceptRepository.save(new LearningConcept("Division"));
        Learner learner = learnerRepository.save(new Learner("Asha"));

        curriculumConceptRepository.save(new CurriculumConcept(curriculum, concept));
        learnerCurriculumRepository.save(new LearnerCurriculum(learner, curriculum));

        assertThat(subjectRepository.findById(subject.getId())).contains(subject);
        assertThat(curriculumRepository.findById(curriculum.getId())).contains(curriculum);
        assertThat(learningConceptRepository.findById(concept.getId())).contains(concept);
        assertThat(learnerRepository.findById(learner.getId())).contains(learner);
        assertThat(curriculumConceptRepository.findByCurriculumId(curriculum.getId())).hasSize(1);
        assertThat(curriculumConceptRepository.existsByCurriculumIdAndLearningConceptId(curriculum.getId(), concept.getId())).isTrue();
        assertThat(learnerCurriculumRepository.findByLearnerId(learner.getId())).hasSize(1);
        assertThat(learnerCurriculumRepository.existsByLearnerIdAndCurriculumId(learner.getId(), curriculum.getId())).isTrue();
    }
}
