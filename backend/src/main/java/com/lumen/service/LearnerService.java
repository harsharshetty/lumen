package com.lumen.service;

import com.lumen.domain.Learner;

import java.util.List;
import java.util.UUID;

public interface LearnerService {
    Learner createLearner(String displayName);
    Learner getLearner(UUID id);
    List<Learner> listLearners();
}
