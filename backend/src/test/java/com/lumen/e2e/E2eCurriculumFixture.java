package com.lumen.e2e;

import com.lumen.domain.Curriculum;
import com.lumen.domain.Subject;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.SubjectRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Profile("e2e")
public class E2eCurriculumFixture implements ApplicationRunner {
    private final SubjectRepository subjectRepository;
    private final CurriculumRepository curriculumRepository;

    public E2eCurriculumFixture(SubjectRepository subjectRepository,
                                CurriculumRepository curriculumRepository) {
        this.subjectRepository = subjectRepository;
        this.curriculumRepository = curriculumRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        Map<String, Subject> subjects = subjectRepository.findAll().stream()
                .collect(Collectors.toMap(Subject::getName, Function.identity()));
        Subject mathematics = subjects.computeIfAbsent("Mathematics", name -> subjectRepository.save(new Subject(name)));
        Subject hindi = subjects.computeIfAbsent("Hindi", name -> subjectRepository.save(new Subject(name)));

        Map<String, Curriculum> curricula = curriculumRepository.findAll().stream()
                .collect(Collectors.toMap(Curriculum::getName, Function.identity()));

        seed(curricula, "CBSE Grade 3 Mathematics", mathematics, true);
        seed(curricula, "Olympiad Mathematics", mathematics, true);
        seed(curricula, "CBSE Grade 3 Hindi", hindi, true);
        seed(curricula, "Archived Grade 3 Mathematics", mathematics, false);
    }

    private void seed(Map<String, Curriculum> curricula,
                      String name,
                      Subject subject,
                      boolean active) {
        if (curricula.containsKey(name)) {
            return;
        }
        Curriculum curriculum = new Curriculum(name, "Grade 3", subject);
        curriculum.setActive(active);
        curriculumRepository.save(curriculum);
    }
}
