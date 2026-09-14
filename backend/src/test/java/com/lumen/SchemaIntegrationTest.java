package com.lumen;
import com.lumen.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest
class SchemaIntegrationTest {
    @Autowired SubjectRepository subjectRepository;
    @Autowired CurriculumRepository curriculumRepository;
    @Autowired LearningConceptRepository learningConceptRepository;
    @Autowired CurriculumConceptRepository curriculumConceptRepository;
    @Autowired LearnerRepository learnerRepository;
    @Autowired LearnerCurriculumRepository learnerCurriculumRepository;
    @Test void flywayCreatesAllV0TablesAndRepositoriesLoad() {
        assertThat(subjectRepository.count()).isZero();
        assertThat(curriculumRepository.count()).isZero();
        assertThat(learningConceptRepository.count()).isZero();
        assertThat(curriculumConceptRepository.count()).isZero();
        assertThat(learnerRepository.count()).isZero();
        assertThat(learnerCurriculumRepository.count()).isZero();
    }
}
