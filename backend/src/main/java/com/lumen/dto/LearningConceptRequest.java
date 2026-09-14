package com.lumen.dto;
import jakarta.validation.constraints.NotBlank;
public record LearningConceptRequest(@NotBlank String name) {}
