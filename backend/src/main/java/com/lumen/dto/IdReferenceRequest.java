package com.lumen.dto;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
public record IdReferenceRequest(@NotNull UUID id) {}
