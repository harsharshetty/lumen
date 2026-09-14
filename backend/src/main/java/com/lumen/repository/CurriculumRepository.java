package com.lumen.repository;

import com.lumen.domain.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CurriculumRepository extends JpaRepository<Curriculum, UUID> {
}
