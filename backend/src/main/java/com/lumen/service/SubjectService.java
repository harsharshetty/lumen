package com.lumen.service;

import com.lumen.domain.Subject;

import java.util.List;
import java.util.UUID;

public interface SubjectService {
    Subject createSubject(String name);
    Subject getSubject(UUID id);
    List<Subject> listSubjects();
}
