package com.lumen.repository;

import com.lumen.domain.Curriculum;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CurriculumRepository extends JpaRepository<Curriculum, UUID> {
    @Override
    @EntityGraph(attributePaths = "subject")
    Optional<Curriculum> findById(UUID id);

    @EntityGraph(attributePaths = "subject")
    List<Curriculum> findAllByActiveTrue();
}
