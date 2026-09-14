package com.lumen.controller;
import com.lumen.dto.*;
import com.lumen.mappers.DomainMapper;
import com.lumen.service.LearningConceptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/learning-concepts")
public class LearningConceptController {
    private final LearningConceptService service;
    public LearningConceptController(LearningConceptService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public LearningConceptResponse create(@Valid @RequestBody LearningConceptRequest request) { return DomainMapper.toResponse(service.create(request.name())); }
    @GetMapping("/{id}") public LearningConceptResponse get(@PathVariable UUID id) { return DomainMapper.toResponse(service.get(id)); }
    @GetMapping public List<LearningConceptResponse> list() { return service.list().stream().map(DomainMapper::toResponse).toList(); }
}
