package com.lumen.controller;
import com.lumen.dto.*;
import com.lumen.mappers.DomainMapper;
import com.lumen.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/curricula")
public class CurriculumController {
    private final CurriculumService service;
    private final CurriculumConceptService conceptService;
    public CurriculumController(CurriculumService service, CurriculumConceptService conceptService) { this.service = service; this.conceptService = conceptService; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public CurriculumResponse create(@Valid @RequestBody CurriculumRequest request) { return DomainMapper.toResponse(service.create(request.name(), request.gradeLevel(), request.subjectId())); }
    @GetMapping("/{id}") public CurriculumResponse get(@PathVariable UUID id) { return DomainMapper.toResponse(service.get(id)); }
    @GetMapping public List<CurriculumResponse> list() { return service.list().stream().map(DomainMapper::toResponse).toList(); }
    @PostMapping("/{id}/concepts") @ResponseStatus(HttpStatus.NO_CONTENT) public void addConcept(@PathVariable UUID id, @Valid @RequestBody IdReferenceRequest request) { conceptService.addConcept(id, request.id()); }
    @GetMapping("/{id}/concepts") public List<LearningConceptResponse> listConcepts(@PathVariable UUID id) { return conceptService.listConcepts(id).stream().map(DomainMapper::toResponse).toList(); }
}
