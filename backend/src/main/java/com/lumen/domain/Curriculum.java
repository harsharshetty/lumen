package com.lumen.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "curricula")
public class Curriculum {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String name;
    @Column(name = "grade_level", nullable = false)
    private String gradeLevel;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    protected Curriculum() {}
    public Curriculum(String name, String gradeLevel, Subject subject) {
        this.name = name;
        this.gradeLevel = gradeLevel;
        this.subject = subject;
    }
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getGradeLevel() { return gradeLevel; }
    public Subject getSubject() { return subject; }
    public void setName(String name) { this.name = name; }
    public void setGradeLevel(String gradeLevel) { this.gradeLevel = gradeLevel; }
    public void setSubject(Subject subject) { this.subject = subject; }
}
