package com.lumen.service.impl;

import com.lumen.domain.Subject;
import com.lumen.repository.SubjectRepository;
import com.lumen.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository repository;

    @Override
    public Subject createSubject(String name) {
        return repository.save(new Subject(name));
    }

    @Override
    public Subject getSubject(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + id));
    }

    @Override
    public List<Subject> listSubjects() {
        return repository.findAll();
    }
}
