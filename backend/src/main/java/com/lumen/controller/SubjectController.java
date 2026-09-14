package com.lumen.controller;
import com.lumen.dto.*;
import com.lumen.mappers.DomainMapper;
import com.lumen.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectService service;
    public SubjectController(SubjectService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public SubjectResponse create(@Valid @RequestBody SubjectRequest request) { return DomainMapper.toResponse(service.create(request.name())); }
    @GetMapping("/{id}") public SubjectResponse get(@PathVariable UUID id) { return DomainMapper.toResponse(service.get(id)); }
    @GetMapping public List<SubjectResponse> list() { return service.list().stream().map(DomainMapper::toResponse).toList(); }
}
