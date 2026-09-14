package com.lumen.repository;

import com.lumen.domain.Learner;
import com.lumen.domain.User;
import com.lumen.domain.UserLearnerAccess;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserLearnerAccessRepository extends JpaRepository<UserLearnerAccess, UUID> {
    Optional<UserLearnerAccess> findByUserAndLearner(User user, Learner learner);

    @EntityGraph(attributePaths = "learner")
    Optional<UserLearnerAccess> findByUserAndLearnerId(User user, UUID learnerId);

    @EntityGraph(attributePaths = "learner")
    List<UserLearnerAccess> findAllByUser(User user);
}
