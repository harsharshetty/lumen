package com.lumen.dto;
import jakarta.validation.constraints.NotBlank;
public record LearnerRequest(@NotBlank String displayName) {}
