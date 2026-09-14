package com.lumen.repository;

import com.lumen.domain.LearningConcept;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LearningConceptRepository extends JpaRepository<LearningConcept, UUID> {
}
