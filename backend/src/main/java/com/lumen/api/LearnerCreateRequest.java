package com.lumen.api;

import jakarta.validation.constraints.NotBlank;

public record LearnerCreateRequest(@NotBlank String displayName) {
}
