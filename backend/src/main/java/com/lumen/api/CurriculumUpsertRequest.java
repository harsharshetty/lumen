package com.lumen.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CurriculumUpsertRequest(@NotBlank String name, @NotBlank String gradeLevel, @NotNull UUID subjectId) {
}
