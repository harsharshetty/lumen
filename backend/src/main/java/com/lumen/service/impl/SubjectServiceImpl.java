package com.lumen.service.impl;

import com.lumen.domain.Subject;
import com.lumen.repository.SubjectRepository;
import com.lumen.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository repository;

    @Override
    @Transactional
    public Subject create(String name) {
        return repository.save(new Subject(name));
    }

    @Override
    public Subject get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + id));
    }

    @Override
    public List<Subject> list() {
        return repository.findAll();
    }
}
