package com.lumen.service.impl;
import com.lumen.domain.Curriculum;
import com.lumen.domain.Subject;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.SubjectRepository;
import com.lumen.service.CurriculumService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
@Service
@Transactional(readOnly = true)
public class CurriculumServiceImpl implements CurriculumService {
    private final CurriculumRepository curriculumRepository;
    private final SubjectRepository subjectRepository;
    public CurriculumServiceImpl(CurriculumRepository curriculumRepository, SubjectRepository subjectRepository) { this.curriculumRepository = curriculumRepository; this.subjectRepository = subjectRepository; }
    @Override @Transactional public Curriculum create(String name, String gradeLevel, UUID subjectId) {
        Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new IllegalArgumentException("Subject not found: " + subjectId));
        return curriculumRepository.save(new Curriculum(name, gradeLevel, subject));
    }
    @Override public Curriculum get(UUID id) { return curriculumRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Curriculum not found: " + id)); }
    @Override public List<Curriculum> list() { return curriculumRepository.findAll(); }
}
