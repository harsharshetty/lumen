package com.lumen.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
public record CurriculumRequest(@NotBlank String name, @NotBlank String gradeLevel, @NotNull UUID subjectId) {}
