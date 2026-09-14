package com.lumen.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "curriculum_concepts", uniqueConstraints = @UniqueConstraint(name = "uq_curriculum_concept", columnNames = {"curriculum_id", "learning_concept_id"}))
public class CurriculumConcept {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curriculum_id", nullable = false)
    private Curriculum curriculum;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learning_concept_id", nullable = false)
    private LearningConcept learningConcept;

    protected CurriculumConcept() {}
    public CurriculumConcept(Curriculum curriculum, LearningConcept learningConcept) {
        this.curriculum = curriculum;
        this.learningConcept = learningConcept;
    }
    public UUID getId() { return id; }
    public Curriculum getCurriculum() { return curriculum; }
    public LearningConcept getLearningConcept() { return learningConcept; }
}
