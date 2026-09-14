package com.lumen.mappers;

import com.lumen.domain.*;
import com.lumen.dto.*;

public final class DomainMapper {
    private DomainMapper() {}
    public static SubjectResponse toResponse(Subject value) { return new SubjectResponse(value.getId(), value.getName()); }
    public static CurriculumResponse toResponse(Curriculum value) { return new CurriculumResponse(value.getId(), value.getName(), value.getGradeLevel(), value.getSubject().getId()); }
    public static LearningConceptResponse toResponse(LearningConcept value) { return new LearningConceptResponse(value.getId(), value.getName()); }
    public static LearnerResponse toResponse(Learner value) { return new LearnerResponse(value.getId(), value.getDisplayName()); }
}
