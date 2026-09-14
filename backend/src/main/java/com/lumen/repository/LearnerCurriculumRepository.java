package com.lumen.repository;
import com.lumen.domain.LearnerCurriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface LearnerCurriculumRepository extends JpaRepository<LearnerCurriculum, UUID> {
    List<LearnerCurriculum> findByLearnerId(UUID learnerId);
    boolean existsByLearnerIdAndCurriculumId(UUID learnerId, UUID curriculumId);
}
