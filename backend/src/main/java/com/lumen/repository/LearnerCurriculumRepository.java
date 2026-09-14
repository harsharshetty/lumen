package com.lumen.repository;

import com.lumen.domain.LearnerCurriculum;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearnerCurriculumRepository extends JpaRepository<LearnerCurriculum, UUID> {
    @EntityGraph(attributePaths = {"curriculum", "curriculum.subject"})
    List<LearnerCurriculum> findByLearnerId(UUID learnerId);

    @EntityGraph(attributePaths = {"curriculum", "curriculum.subject"})
    Optional<LearnerCurriculum> findByLearnerIdAndCurriculumId(UUID learnerId, UUID curriculumId);

    boolean existsByLearnerIdAndCurriculumId(UUID learnerId, UUID curriculumId);
}
