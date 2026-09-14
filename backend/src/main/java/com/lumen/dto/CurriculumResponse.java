package com.lumen.dto;
import java.util.UUID;
public record CurriculumResponse(UUID id, String name, String gradeLevel, UUID subjectId) {}
