package com.lumen.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "learners")
public class Learner {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "display_name", nullable = false)
    private String displayName;

    protected Learner() {}

    public Learner(String displayName) { this.displayName = displayName; }

    public UUID getId() { return id; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}
