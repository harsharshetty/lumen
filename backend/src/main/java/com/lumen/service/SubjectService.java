package com.lumen.service;

import com.lumen.domain.Subject;

import java.util.List;
import java.util.UUID;

public interface SubjectService {
    Subject create(String name);
    Subject get(UUID id);
    List<Subject> list();
}
