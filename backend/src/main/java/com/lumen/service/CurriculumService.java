package com.lumen.service;
import com.lumen.domain.Curriculum;
import java.util.List;
import java.util.UUID;
public interface CurriculumService {
    Curriculum create(String name, String gradeLevel, UUID subjectId);
    Curriculum get(UUID id);
    List<Curriculum> list();
}
