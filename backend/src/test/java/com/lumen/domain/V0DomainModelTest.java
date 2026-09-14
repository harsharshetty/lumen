package com.lumen.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class V0DomainModelTest {

    @Test
    void curriculumSupportsConstructorsGettersAndSetters() {
        Subject firstSubject = new Subject("Mathematics");
        Subject secondSubject = new Subject("Science");
        Curriculum curriculum = new Curriculum("CBSE Grade 3 Mathematics", "3", firstSubject);

        assertThat(curriculum.getId()).isNull();
        assertThat(curriculum.getName()).isEqualTo("CBSE Grade 3 Mathematics");
        assertThat(curriculum.getGradeLevel()).isEqualTo("3");
        assertThat(curriculum.getSubject()).isSameAs(firstSubject);

        curriculum.setName("Olympiad Grade 3 Mathematics");
        curriculum.setGradeLevel("Grade 3");
        curriculum.setSubject(secondSubject);

        assertThat(curriculum.getName()).isEqualTo("Olympiad Grade 3 Mathematics");
        assertThat(curriculum.getGradeLevel()).isEqualTo("Grade 3");
        assertThat(curriculum.getSubject()).isSameAs(secondSubject);

        Curriculum empty = new Curriculum();
        assertThat(empty.getId()).isNull();
        assertThat(empty.getName()).isNull();
        assertThat(empty.getGradeLevel()).isNull();
        assertThat(empty.getSubject()).isNull();
    }

    @Test
    void learningConceptSupportsConstructorsGettersAndSetters() {
        LearningConcept concept = new LearningConcept("Fractions");
        assertThat(concept.getId()).isNull();
        assertThat(concept.getName()).isEqualTo("Fractions");

        concept.setName("Division");
        assertThat(concept.getName()).isEqualTo("Division");

        LearningConcept empty = new LearningConcept();
        assertThat(empty.getId()).isNull();
        assertThat(empty.getName()).isNull();
    }

    @Test
    void curriculumConceptSupportsConstructorsAndGetters() {
        Subject subject = new Subject("Mathematics");
        Curriculum curriculum = new Curriculum("CBSE Grade 3 Mathematics", "3", subject);
        LearningConcept concept = new LearningConcept("Division");
        CurriculumConcept mapping = new CurriculumConcept(curriculum, concept);

        assertThat(mapping.getId()).isNull();
        assertThat(mapping.getCurriculum()).isSameAs(curriculum);
        assertThat(mapping.getLearningConcept()).isSameAs(concept);

        CurriculumConcept empty = new CurriculumConcept();
        assertThat(empty.getId()).isNull();
        assertThat(empty.getCurriculum()).isNull();
        assertThat(empty.getLearningConcept()).isNull();
    }

    @Test
    void learnerSupportsConstructorsGettersAndSetters() {
        Learner learner = new Learner("Asha");
        assertThat(learner.getId()).isNull();
        assertThat(learner.getDisplayName()).isEqualTo("Asha");

        learner.setDisplayName("Anika");
        assertThat(learner.getDisplayName()).isEqualTo("Anika");

        Learner empty = new Learner();
        assertThat(empty.getId()).isNull();
        assertThat(empty.getDisplayName()).isNull();
    }

    @Test
    void learnerCurriculumSupportsConstructorsAndGetters() {
        Learner learner = new Learner("Asha");
        Subject subject = new Subject("Mathematics");
        Curriculum curriculum = new Curriculum("CBSE Grade 3 Mathematics", "3", subject);
        LearnerCurriculum enrollment = new LearnerCurriculum(learner, curriculum);

        assertThat(enrollment.getId()).isNull();
        assertThat(enrollment.getLearner()).isSameAs(learner);
        assertThat(enrollment.getCurriculum()).isSameAs(curriculum);

        LearnerCurriculum empty = new LearnerCurriculum();
        assertThat(empty.getId()).isNull();
        assertThat(empty.getLearner()).isNull();
        assertThat(empty.getCurriculum()).isNull();
    }
}
