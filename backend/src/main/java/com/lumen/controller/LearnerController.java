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
@RequestMapping("/api/learners")
public class LearnerController {
    private final LearnerService service;
    private final LearnerCurriculumService curriculumService;
    public LearnerController(LearnerService service, LearnerCurriculumService curriculumService) { this.service = service; this.curriculumService = curriculumService; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public LearnerResponse create(@Valid @RequestBody LearnerRequest request) { return DomainMapper.toResponse(service.create(request.displayName())); }
    @GetMapping("/{id}") public LearnerResponse get(@PathVariable UUID id) { return DomainMapper.toResponse(service.get(id)); }
    @GetMapping public List<LearnerResponse> list() { return service.list().stream().map(DomainMapper::toResponse).toList(); }
    @PostMapping("/{id}/curricula") @ResponseStatus(HttpStatus.NO_CONTENT) public void addCurriculum(@PathVariable UUID id, @Valid @RequestBody IdReferenceRequest request) { curriculumService.addCurriculum(id, request.id()); }
    @GetMapping("/{id}/curricula") public List<CurriculumResponse> listCurricula(@PathVariable UUID id) { return curriculumService.listCurricula(id).stream().map(DomainMapper::toResponse).toList(); }
}
