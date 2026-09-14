package com.lumen.service;

import com.lumen.domain.Curriculum;

import java.util.List;
import java.util.UUID;

public interface LearnerCurriculumService {
    void enrollLearnerInCurriculum(UUID learnerId, UUID curriculumId);
    List<Curriculum> listCurriculaForLearner(UUID learnerId);
}
