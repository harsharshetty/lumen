package com.lumen.repository;

import com.lumen.domain.Learner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LearnerRepository extends JpaRepository<Learner, UUID> {
}
