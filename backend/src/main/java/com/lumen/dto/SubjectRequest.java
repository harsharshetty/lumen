package com.lumen.dto;
import jakarta.validation.constraints.NotBlank;
public record SubjectRequest(@NotBlank String name) {}
