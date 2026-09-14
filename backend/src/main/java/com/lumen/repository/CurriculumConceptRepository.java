package com.lumen.repository;

import com.lumen.domain.CurriculumConcept;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CurriculumConceptRepository extends JpaRepository<CurriculumConcept, UUID> {
    @EntityGraph(attributePaths = "learningConcept")
    List<CurriculumConcept> findByCurriculumId(UUID curriculumId);

    Optional<CurriculumConcept> findByCurriculumIdAndLearningConceptId(UUID curriculumId, UUID learningConceptId);

    boolean existsByCurriculumIdAndLearningConceptId(UUID curriculumId, UUID learningConceptId);
}
