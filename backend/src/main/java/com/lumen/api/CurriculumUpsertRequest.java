package com.lumen.api;

import java.util.UUID;

public record CurriculumUpsertRequest(String name, String gradeLevel, UUID subjectId) {
}
