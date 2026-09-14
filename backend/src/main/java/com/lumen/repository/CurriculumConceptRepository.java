package com.lumen.repository;
import com.lumen.domain.CurriculumConcept;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface CurriculumConceptRepository extends JpaRepository<CurriculumConcept, UUID> {
    List<CurriculumConcept> findByCurriculumId(UUID curriculumId);
    boolean existsByCurriculumIdAndLearningConceptId(UUID curriculumId, UUID learningConceptId);
}
