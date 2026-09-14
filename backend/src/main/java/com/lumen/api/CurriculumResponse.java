package com.lumen.api;

import com.lumen.domain.Curriculum;

import java.util.UUID;

public record CurriculumResponse(UUID id, String name, String gradeLevel, UUID subjectId, boolean active) {
    public static CurriculumResponse from(Curriculum curriculum) {
        return new CurriculumResponse(
                curriculum.getId(),
                curriculum.getName(),
                curriculum.getGradeLevel(),
                curriculum.getSubject().getId(),
                curriculum.isActive());
    }
}
