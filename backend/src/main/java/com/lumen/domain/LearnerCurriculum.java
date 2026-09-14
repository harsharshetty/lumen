package com.lumen.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "learner_curricula", uniqueConstraints = @UniqueConstraint(name = "uq_learner_curriculum", columnNames = {"learner_id", "curriculum_id"}))
public class LearnerCurriculum {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", nullable = false)
    private Learner learner;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curriculum_id", nullable = false)
    private Curriculum curriculum;

    protected LearnerCurriculum() {}

    public LearnerCurriculum(Learner learner, Curriculum curriculum) {
        this.learner = learner;
        this.curriculum = curriculum;
    }

    public UUID getId() { return id; }
    public Learner getLearner() { return learner; }
    public Curriculum getCurriculum() { return curriculum; }
}
