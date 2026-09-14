package com.lumen.api;

import com.lumen.domain.Learner;

import java.util.UUID;

public record LearnerResponse(UUID id, String displayName) {
    public static LearnerResponse from(Learner learner) {
        return new LearnerResponse(learner.getId(), learner.getDisplayName());
    }
}
