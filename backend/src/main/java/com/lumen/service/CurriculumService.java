package com.lumen.service;

import com.lumen.domain.Curriculum;

import java.util.List;
import java.util.UUID;

public interface CurriculumService {
    Curriculum createCurriculum(String name, String gradeLevel, UUID subjectId);
    Curriculum getCurriculum(UUID id);
    List<Curriculum> listCurricula();
}
